package com.gnostica.modules.integration.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        String uniqueIdentifier = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        
        // Remove extension from filename if present
        String publicId = uniqueIdentifier;
        if (originalFilename != null && originalFilename.contains(".")) {
            String nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
            // Optionally sanitize nameWithoutExt here if needed
            publicId = nameWithoutExt + "_" + uniqueIdentifier;
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "gnostica_forum", // You can change this to a specific folder in your Cloudinary
                "public_id", publicId
        ));

        return uploadResult.get("secure_url").toString();
    }

    public String uploadAvatar(MultipartFile file) throws IOException {
        String uniqueIdentifier = UUID.randomUUID().toString();
        
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "gnostica_avatars",
                "public_id", "avatar_" + uniqueIdentifier,
                "gravity", "face",
                "height", 500,
                "width", 500,
                "crop", "thumb",
                "quality", "auto",
                "fetch_format", "auto"
        ));

        return uploadResult.get("secure_url").toString();
    }

    public String uploadDocument(MultipartFile file) throws IOException {
        String uniqueIdentifier = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        
        String publicId = uniqueIdentifier;
        if (originalFilename != null && originalFilename.contains(".")) {
            String nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
            publicId = nameWithoutExt + "_" + uniqueIdentifier;
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "gnostica_documents",
                "public_id", publicId,
                "resource_type", "raw"
        ));

        return uploadResult.get("secure_url").toString();
    }
    
    public void deleteImageByUrl(String imageUrl) throws IOException {
        try {
            // Extract the public ID from the URL. 
            // URL format typically: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<extension>
            String[] urlParts = imageUrl.split("/");
            String targetPart = urlParts[urlParts.length - 1]; // "public_id.jpg"
            String publicIdWithFolder = "gnostica_forum/" + targetPart.substring(0, targetPart.lastIndexOf('.'));
            
            cloudinary.uploader().destroy(publicIdWithFolder, ObjectUtils.emptyMap());
        } catch (Exception e) {
            System.err.println("Failed to delete image from Cloudinary: " + imageUrl + " " + e.getMessage());
            // Depending on requirements, you might ignore this error or re-throw
        }
    }
}
