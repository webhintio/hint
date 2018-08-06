/**
 * @fileoverview Image optimization with cloudinary
 */
import * as crypto from 'crypto';
import * as path from 'path';
import { tmpdir } from 'os';

import * as fs from 'fs-extra';
import * as getImageData from 'image-size';

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, FetchEnd, ScanEnd, HintMetadata } from 'hint/dist/src/lib/types';
import cutString from 'hint/dist/src/lib/utils/misc/cut-string';
import * as logger from 'hint/dist/src/lib/utils/logging';
import { Category } from 'hint/dist/src/lib/enums/category';
import { cloudinaryResult } from './cloudinary-types';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ImageOptimizationCloudinaryHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.performance,
            description: `Image optimization with cloudinary`
        },
        id: 'image-optimization-cloudinary',
        schema: [{
            additionalProperties: false,
            properties: {
                apiKey: { type: 'string' },
                apiSecret: { type: 'string' },
                cloudName: { type: 'string' },
                threshold: { type: 'number' }
            }
        }],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        /*
         * HACK: Need to do a require here in order to be capable of mocking
         *when testing the hint and `import` doesn't work here.
         */
        const cloudinary = require('cloudinary');
        let uploads: Array<Promise<cloudinaryResult>> = [];
        let configured = false;
        let sizeThreshold = 0;

        /* eslint-disable camelcase */

        /** Sends the image to cloudinary to identify optimizations on size and format. */
        const processImage = async (data: FetchEnd): Promise<cloudinaryResult> => {

            /*
             * Using the MD5 hash of the file is the recommended way to avoid duplicates
             * https://support.cloudinary.com/hc/en-us/articles/208158309-How-can-I-completely-prevent-the-existence-of-image-duplications-on-my-Cloudinary-account-
             */
            const hash = crypto
                .createHash('md5')
                .update(data.response.body.rawContent)
                .digest('hex');

            const tempPath = path.join(tmpdir(), 'hint-cloudinary', hash);

            try {
                await fs.ensureFile(tempPath);
                await fs.writeFile(tempPath, data.response.body.rawContent);

                const result = await cloudinary.v2.uploader.upload(tempPath, { crop: 'limit', public_id: hash, quality: 'auto' });

                result.originalBytes = data.response.body.rawContent.length;
                result.originalUrl = data.resource;
                result.element = data.element;

                await fs.remove(tempPath);

                return result;
            } catch (error) {
                logger.error(`Error processing image ${cutString(data.resource)} with cloudinary`);
                logger.error(error);

                // We still want to complete the test
                return null;

            }
        };

        /** Detects if there is a valid cloudinary configuration. */
        const isConfigured = (hintOptions) => {
            const cloudinaryUrl = process.env.CLOUDINARY_URL; // eslint-disable-line no-process-env
            const { apiKey, apiSecret, cloudName, threshold } = hintOptions;

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
        const analyzeImage = (fetchEnd: FetchEnd) => {
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
        const end = async (data: ScanEnd) => {
            if (!configured) {
                await context.report('', null, `No valid configuration for Cloudinary found. Hint could not run.`);

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
                    await context.report(file.originalUrl, file.element, `'${cutString(file.originalUrl)}' could be around ${sizeDiff.toFixed(2)}kB (${percentageDiff}%) smaller.`);
                }
            }

            if (!reported && totalSavings > sizeThreshold) {
                await context.report('', null, `Total size savings optimizing the images on '${data.resource}' could be of around ${totalSavings.toFixed(0)}kB.`);
            }

            // uploads needs to be cleaned at the end to work propertly with the local connector + watcher
            uploads = [];
        };

        // `context.hintOptions` will be `null` if not specied
        configured = isConfigured(context.hintOptions || { apiKey: '', apiSecret: '', cloudName: '', threshold: 0 });

        context.on('fetch::end::*', analyzeImage);
        context.on('scan::end', end);
    }
}
