# Méthode de développement backend — Gamify

Ce fichier décrit **l'ordre et la manière** d'ajouter une fonctionnalité côté
`gamify-backend`, en s'appuyant sur le socle déjà en place (voir
[.claude/CLAUDE.md](../../CLAUDE.md) pour le contexte général et
[.claude/conventions/backend-java-spring.md](../conventions/backend-java-spring.md)
pour le détail des règles de style). Ce fichier est le "comment on procède",
l'autre est le "quelles sont les règles".

**Avant de commencer une fonctionnalité, lis ce fichier.** Il évite de réinventer
ce qui existe déjà dans le socle (`BaseEntity`, hiérarchie d'exceptions,
`ApiResponse`, `GlobalExceptionHandler`) et fixe l'ordre des étapes.

## Rappel de l'architecture en place

```
com.gamify
├─ domain/            entities/ (héritent de BaseEntity sauf log immuable),
│                      enums/, exceptions/ (hiérarchie déjà là, réutiliser avant
│                      d'en créer une nouvelle)
├─ application/        dtos/<feature>/ (records), services/ (classes concrètes,
│                      pas d'interface séparée sauf besoin réel de 2 implém.)
├─ infrastructure/      persistence/ (interfaces Spring Data, utilisées
│                      directement — pas de split interface/impl),
│                      config/ (beans Spring transverses)
└─ presentation/        controllers/ (minces, retournent ApiResponse<T>),
                        advice/ (GlobalExceptionHandler déjà présent, généralement
                        pas besoin d'y toucher)
```

## Recette pour ajouter une fonctionnalité (ex. "Activités/Kanban", "Badges"...)

### 1. Domain — l'entité d'abord, jamais la table d'abord
- Créer/modifier l'entité JPA dans `domain/entities/`. Hériter de `BaseEntity`
  sauf si c'est un log append-only immuable (voir `ProgressionLog` : pas de
  `updatedAt` qui aurait du sens sur un historique).
- Mettre la logique métier **dans l'entité** si elle est intrinsèque à l'objet
  (Rich Domain Model) — pas systématiquement dans le service.
- Enums dans `domain/enums/` (fichier dédié, pas imbriqué dans l'entité — voir
  `StatutKanban`).
- Si une erreur métier nouvelle apparaît, vérifier d'abord si
  `DomainException`/`NotFoundException`/`ConflictException`/`UnauthorizedException`/
  `ForbiddenException` (déjà dans `domain/exceptions/`) suffit avant d'en créer une
  nouvelle.

### 2. Migration Flyway — la conséquence, jamais le point de départ
- Une fois l'entité stabilisée, écrire `V{n}__description.sql` dans
  `db/migration/` qui reflète exactement les champs/colonnes de l'entité.
- **Ne jamais modifier une migration déjà écrite** (`V1`, `V2`...) — toujours en
  ajouter une nouvelle, même pour corriger une erreur.
- Vérifier le numéro `V{n}` suivant disponible avant de créer le fichier
  (`ls db/migration/`).

### 3. Repository — Spring Data direct
- Une interface par entité dans `infrastructure/persistence/`, `extends
  JpaRepository<Entity, Long>` (`Long` = choix acté pour tout le projet, pas
  d'UUID). Ajouter les méthodes de requête dérivées nécessaires
  (`findByXxx`). Pas de couche `IRepository` + `RepositoryImpl` séparée — décision
  actée pour ce projet (déjà DIP-compliant via l'interface Spring Data).

### 4. DTOs — jamais l'entité exposée directement
- Records dans `application/dtos/<feature>/` : un `XxxRequest` par action
  d'entrée, un `XxxResponse` pour la sortie. Annotations Bean Validation
  (`@NotBlank`, `@NotNull`, `@Size`...) sur les composants du record.
- Réutiliser `ApiResponse<T>` (`application/dtos/ApiResponse.java`) comme
  enveloppe de retour — ne pas créer de nouvelle enveloppe.

### 5. Service — la classe concrète, pas d'interface par défaut
- Une classe `@Service` dans `application/services/`, injection par constructeur
  (`@RequiredArgsConstructor`, champs `final`).
- Lever les exceptions typées du domaine (jamais `RuntimeException` brute) — le
  `GlobalExceptionHandler` existant les convertit déjà en bon code HTTP, rien à
  ajouter côté controller.
- `@Slf4j` pour logguer les événements métier significatifs (création, échec de
  validation, transition d'état...), jamais de donnée sensible en clair.
- Pas de nouvelle interface `IXxxService` sauf besoin réel de polymorphisme
  (plusieurs implémentations interchangeables) — cf. décision actée sur
  `AuthService`.

### 6. Controller — mince, ApiResponse, pagination
- `@RestController` dans `presentation/controllers/`, ~5 lignes par action,
  aucune logique métier, aucun repository/EntityManager injecté directement.
- Retourne `ApiResponse<T>` (pas l'entité). `@Valid @RequestBody` sur les DTOs
  d'entrée. Codes HTTP corrects (`@ResponseStatus(HttpStatus.CREATED)` sur les
  `POST` de création, etc. — voir table des verbes dans le doc de convention).
- Toute liste retournée est paginée (`Page<T>`, params `page`/`size`).

### 7. Sécurité
- Les endpoints sensibles doivent vérifier l'ownership (un user ne modifie que
  ses propres données) — même si le filtre JWT est encore un TODO (voir
  [roadmap.md](roadmap.md), section "Dette technique connue"). Ne pas oublier de
  le résoudre avant de livrer un endpoint réellement protégé.

### 8. Tests
- Test unitaire du service avec Mockito, structure AAA, nommage
  `methodName_scenario_expected` (ex. `createActivity_validData_returnsDto`,
  `createActivity_missingAttribute_throwsDomainException`).
- Couvrir au moins un cas nominal et un cas d'erreur métier par méthode de
  service publique.

### 9. Avant de considérer la fonctionnalité terminée
- Relire la grille de revue P0/P1 dans
  [backend-java-spring.md](../conventions/backend-java-spring.md) (section 11).
- Compiler (`mvnw compile`) et, si une base locale est dispo, démarrer le backend
  pour vérifier que Flyway applique la nouvelle migration et que
  `ddl-auto=validate` passe.

## Exemple concret déjà en place (à copier comme patron)

Le flux `auth` (`RegisterRequest`/`LoginRequest` → `AuthService` → `AuthController`)
suit déjà cette recette de bout en bout — s'en servir de référence directe pour la
prochaine fonctionnalité plutôt que de repartir de zéro.