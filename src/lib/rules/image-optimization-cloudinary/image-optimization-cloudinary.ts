/**
 * @fileoverview Image optimization with cloudinary
 */
import * as crypto from 'crypto';

import * as getImageData from 'image-size';

import { RuleContext } from '../../rule-context';
import { IRule, IRuleBuilder, IFetchEnd, IScanEnd } from '../../types';
import { cutString } from '../../utils/misc';
import * as logger from '../../utils/logging';
import { Category } from '../../enums/category';
import { cloudinaryResult } from './cloudinary-types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        /*
         * HACK: Need to do a require here in order to be capable of mocking
         *when testing the rule and `import` doesn't work here.
         */
        const cloudinary = require('cloudinary');
        const uploads: Array<Promise<cloudinaryResult>> = [];
        let configured = false;
        let sizeThreshold = 0;

        /* eslint-disable camelcase */

        /** Sends the image to cloudinary to identify optimizations on size and format. */
        const processImage = (data: IFetchEnd): Promise<cloudinaryResult> => {

            /*
             * Using the MD5 hash of the file is the recommended way to avoid duplicates
             * https://support.cloudinary.com/hc/en-us/articles/208158309-How-can-I-completely-prevent-the-existence-of-image-duplications-on-my-Cloudinary-account-
             */
            const hash = crypto
                .createHash('md5')
                .update(data.response.body.rawContent)
                .digest('hex');

            return new Promise((resolve, reject) => {
                return cloudinary.v2.uploader.upload_stream(
                    { crop: 'limit', public_id: hash, quality: 'auto' },
                    (error, result) => {
                        if (error) {
                            logger.error(`Error processing image ${cutString(data.resource)} with cloudinary`);
                            logger.error(error);

                            return reject(error);
                        }

                        result.originalBytes = data.response.body.rawContent.length;
                        result.originalUrl = data.resource;
                        result.element = data.element;

                        return resolve(result);
                    })
                    .end(data.response.body.rawContent);
            });
        };

        /** Detects if there is a valid cloudinary configuration. */
        const isConfigured = (ruleOptions) => {
            const cloudinaryUrl = process.env.CLOUDINARY_URL; // eslint-disable-line no-process-env
            const { apiKey, apiSecret, cloudName, threshold } = ruleOptions;

            if (threshold) {
                sizeThreshold = threshold;
            }

            if (cloudinaryUrl) {
                return true;
            }

            if (!apiKey || !apiSecret || !cloudName) {
                logger.error('No configuration found for cloudinary');

                return false;
            }

            cloudinary.v2.config({
                api_key: apiKey,
                api_secret: apiSecret,
                cloud_name: cloudName
            });

            return true;
        };
        /* eslint-enable camelcase */

        /** Analyzes the response if it's an image. */
        const analyzeImage = (fetchEnd: IFetchEnd) => {
            if (!configured) {
                return;
            }

            const { response } = fetchEnd;

            try {
                // TODO: Find a better way than doing this to detect if it's an image
                getImageData(response.body.rawContent);

                uploads.push(processImage(fetchEnd));
            } catch (e) {
                if (e instanceof TypeError) {
                    // Not an image, ignoring
                }
            }
        };

        /** Waits to gather the results of all the images and notifies if there is any possible savings. */
        const end = async (data: IScanEnd) => {
            if (!configured) {
                await context.report('', null, `No valid configuration for Cloudinary found. Rule coudn't run.`);

                return;
            }

            const results = await Promise.all(uploads);

            const unoptimized = results.filter((result) => {
                if (!result) {
                    return false;
                }

                return result.bytes < result.originalBytes;
            });

            let reported = false;
            let totalSavings = 0;

            for (const file of unoptimized) {
                const sizeDiff = (file.originalBytes - file.bytes) / 1000;
                const percentageDiff = Math.round((1 - (file.bytes / file.originalBytes)) * 100);

                totalSavings += sizeDiff;

                if (sizeDiff >= sizeThreshold) {
                    reported = true;
                    await context.report(file.originalUrl, file.element, `File ${cutString(file.originalUrl)} could be around ${sizeDiff.toFixed(2)}kB (${percentageDiff}%) smaller.`);
                }
            }

            if (!reported && totalSavings > sizeThreshold) {
                await context.report('', null, `The total size savings optimizing the images in ${data.resource} could be of around ${totalSavings.toFixed(0)}kB.`);
            }
        };

        // `context.ruleOptions` will be `null` if not specied
        configured = isConfigured(context.ruleOptions || { apiKey: '', apiSecret: '', cloudName: '', threshold: 0});

        return {
            'fetch::end': analyzeImage,
            'scan::end': end
        };
    },
    meta: {
        docs: {
            category: Category.performance,
            description: `Image optimization with cloudinary`
        },
        recommended: false,
        schema: [{
            additionalProperties: false,
            properties: {
                apiKey: { type: 'string' },
                apiSecret: { type: 'string' },
                cloudName: { type: 'string' },
                threshold: { type: 'number' }
            }
        }],
        worksWithLocalFiles: true
    }
};

module.exports = rule;
