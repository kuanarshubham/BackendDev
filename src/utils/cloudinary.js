import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadResult = async  (filePath) => {
    try{
        if(!filePath) return null;

        const responseUpload = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto'
        });

        console.log("File uploaded sucessfully: ", responseUpload.url);

        fs.unlinkSync(filePath);
        return responseUpload;
    }
    catch(err){
        fs.unlinkSync(filePath);
        return null;
    }

}

export {uploadResult};
