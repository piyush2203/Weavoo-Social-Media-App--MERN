import datauriParser from "datauri/parser.js"
import path from "path";

const parser = new datauriParser(); 
//datauriParser class, which will be used to convert file buffers into Data URIs.
//Data URI is a base64-encoded string that represents the file data and can be used directly in HTML or CSS.

const getDataUri = (file)=>{
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer).content;
};

export default getDataUri;