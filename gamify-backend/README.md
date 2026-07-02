# Gamify — Backend Spring Boot

## Stack
- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- PostgreSQL
- Lombok

## Structure des packages

```
com.gamify/
├── GamifyApplication.java       ← Point d'entrée
├── auth/
│   ├── AuthController.java      ← POST /api/auth/register & /login
│   ├── AuthService.java
│   └── AuthDto.java
├── user/
│   ├── User.java                ← Entité utilisateur + attributs RPG
│   └── UserRepository.java
├── activity/
│   └── Activity.java            ← Entité tâche Kanban
├── progression/
│   └── ProgressionLog.java      ← Historique XP
├── agenda/                      ← (à développer)
└── config/
    ├── SecurityConfig.java
    └── JwtService.java
```

## Lancer le projet

1. Créer la base de données PostgreSQL (voir init.sql)
2. Ajuster `application.properties` si besoin
3. `mvn spring-boot:run`

## Endpoints disponibles

| Méthode | URL | Description |
|---|---|---|
| GET | /api/auth/ping | Test de connexion |
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |

## Exemple register

```json
POST /api/auth/register
{
  "username": "Zo",
  "email": "zo@gamify.com",
  "password": "monmotdepasse"
}
```

## Exemple login

```json
POST /api/auth/login
{
  "email": "zo@gamify.com",
  "password": "monmotdepasse"
}
```
