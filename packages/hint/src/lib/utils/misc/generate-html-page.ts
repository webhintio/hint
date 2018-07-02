/** Creates a valid minimal HTML */
export default (head: string = '<title>test</title>', body: string = ''): string => {
    return `<!doctype html>
<html lang="en">
    <head>
        ${head}
    </head>
    <body>
        ${body}
    </body>
</html>`;
};
