export const generateHTMLPage = (head = '<title>test</title>', body = ''): string => {
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
