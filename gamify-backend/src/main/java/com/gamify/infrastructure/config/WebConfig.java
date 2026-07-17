package com.gamify.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/** Sert les fichiers uploadés (avatars) en statique sur /uploads/**. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${gamify.uploads.dir}")
    private String uploadsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // toUri() n'ajoute le "/" final que si le dossier existe déjà au démarrage —
        // or il est créé paresseusement au premier upload : on force le suffixe.
        String location = Paths.get(uploadsDir).toAbsolutePath().toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}
