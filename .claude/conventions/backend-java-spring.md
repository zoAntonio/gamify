# Conventions Java / Spring Boot — Gamify

Condensé de `docs/Convention_Java_SpringBoot.pdf` (v1.0, 2026). Référence complète
dans le PDF si un détail manque ici. Portée : Java 17/21 + Spring Boot 3.x.

## 1. Nommage

| Élément | Convention | Exemple correct | Exemple incorrect |
|---|---|---|---|
| Classe | PascalCase | `OrderService` | `orderService`, `order_service` |
| Interface | PascalCase (I optionnel, préférer suffixe Impl sur l'implém.) | `OrderService` / `IOrderService` | `OrderServiceImpl` comme nom d'interface |
| Enum | PascalCase singulier | `OrderStatus` | `OrderStatuses`, `STATUS` |
| Méthode | camelCase verbe+nom | `calculateTotal()` | `CalculateTotal()`, `calc()` |
| Variable locale | camelCase | `orderTotal` | `OrderTotal`, `order_total` |
| Constante | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` | `maxRetry` |
| Champ privé | camelCase | `orderRepository` | `_orderRepo` |
| Package | lowercase.points | `com.gamify.domain` | `com.Gamify.Domain` |
| Test | `methodName_scenario_expected` | `createOrder_validData_returnsDto` | `testCreateOrder1` |
| Record | PascalCase | `LoginRequest` | `loginRequest` |
| DTO | PascalCase + Dto/Request/Response | `CreateOrderDto` | `OrderDTO`, `createOrder` |
| Exception custom | PascalCase + Exception | `NotFoundException` | `notFound`, `NFException` |
| Annotation | @PascalCase | `@Transactional` | `@transactional` |

Suffixes/patterns Spring : `@Service` service métier, `@Repository` accès données,
`@RestController` HTTP, `@Component` bean générique, `Exception` custom,
`Dto/Request/Response` transfert, `Validator`, `Mapper`, `Config`, `Spec/Specification`,
`Factory`, `Strategy`, `Tests`.

**Règle d'or nommage** : un nom doit révéler l'intention ; si un commentaire est
nécessaire pour comprendre un nom, le nom est mauvais.

Jamais : abréviation non universelle, notation hongroise (`strName`), underscore
dans les noms publics, numérotation (`handler1`), mots génériques seuls (`Manager`,
`Helper`, `Utils`), négation booléenne (`isNotActive`).

## 2. Organisation du code

Ordre strict dans un fichier : package → imports (`java.*` → `javax.*` →
`org.spring.*` → projet) → annotations Spring → constantes → dépendances injectées
(`final`) → méthodes publiques → méthodes privées.

Limites : méthode 30 lignes max, classe 300 lignes max, 4 paramètres de méthode max
(sinon DTO/record), imbrication 3 niveaux max (early return), ligne 120 caractères,
héritage 2 niveaux max (préférer composition).

Structure de packages Clean Architecture (cible) :
```
com.gamify
├─ domain/            ← noyau métier pur, aucune dépendance Spring
│  ├─ entities/ exceptions/ enums/ valueobjects/
├─ application/        ← cas d'usage : interfaces service, DTOs, mappers
│  └─ services/interfaces/ dtos/ mappers/
├─ infrastructure/     ← implémentations techniques
│  └─ persistence/repositories/ services/ config/
└─ presentation/       ← HTTP
   └─ controllers/ middleware/ advice/
```
Dépendances : Domain ← Application ← Infrastructure ← Presentation. Le Domain ne
dépend jamais de Spring/Hibernate directement. Voir "État actuel" dans `CLAUDE.md`
racine — le repo n'est pas encore structuré ainsi.

## 3. SOLID

- **SRP** : une classe = une seule raison de changer (ex. ne pas mettre hashing +
  email + JWT + audit dans un seul `UserService`).
- **OCP** : ouvert à l'extension, fermé à la modification — polymorphisme/Strategy
  plutôt qu'un `switch` qui grossit à chaque nouveau cas.
- **DIP** : dépendre d'interfaces, jamais de classes concrètes. Dans un constructeur
  `@RequiredArgsConstructor`, chaque champ `final` doit être une interface — un
  `new ConcretClass()` dans un service est une violation.

## 4. Clean Architecture

Rich Domain Model : la logique métier vit **dans l'entité** (ex. `Order.addLine()`
valide et recalcule elle-même), pas dans un service anémique.

Controller mince : zéro logique métier, ~5 lignes par action, jamais de repository
ni d'`EntityManager` injecté directement, jamais d'entité exposée en réponse (DTO).

```java
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public ApiResponse<OrderDto> create(@Valid @RequestBody CreateOrderRequest req) {
    return ApiResponse.success(orderService.create(req), "Commande créée");
}
```

## 5. Design patterns essentiels

- **Repository** : interface dans le Domain, implémentation Spring Data dans
  Infrastructure (`IOrderRepository` ↔ `OrderRepositoryImpl` qui wrappe un
  `OrderJpaRepository extends JpaRepository`).
- **Strategy via beans** : injecter `List<PaymentProcessor>`, Spring fournit tous
  les beans du type, filtrer par `canHandle()`.
- Autres : Builder (Lombok `@Builder`), Factory, Decorator (caching/retry/logging),
  Observer (`@EventListener`), Specification (Spring Data JPA), Singleton (`@Bean`),
  Proxy AOP (`@Transactional`, `@Cacheable`, `@Async`), Template Method.

## 6. Clean Code

Hiérarchie d'exceptions dans le Domain, gérée globalement par
`@RestControllerAdvice` — **jamais de try/catch dans un controller**.

| Exception | Code HTTP |
|---|---|
| `DomainException` | 400 |
| `NotFoundException` | 404 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `ConflictException` | 409 |
| non gérée | 500 (loggée, masquée) |

Logging SLF4J (`@Slf4j` Lombok) uniquement — jamais `System.out.println`, jamais
`log.error("Erreur")` sans contexte/exception, jamais de donnée sensible en clair
(mot de passe) dans un log. Niveaux : TRACE/DEBUG/INFO (événements métier)/WARN
(anormal non bloquant)/ERROR (récupérable).

`@Async` : le retour ne doit jamais être `void` (exceptions perdues) ; un appel
`@Async` depuis la même classe est ignoré (pas de proxy Spring).

## 7. API RESTful

| Verbe | Route | Code succès |
|---|---|---|
| GET | `/api/orders` (paginé, filtres) | 200 |
| GET | `/api/orders/{id}` | 200/404 |
| POST | `/api/orders` | 201 |
| PUT | `/api/orders/{id}` | 200/404 |
| PATCH | `/api/orders/{id}` | 200/404 |
| DELETE | `/api/orders/{id}` | 204 |
| POST | `/api/orders/{id}/validate` (action) | 200 |

Enveloppe de réponse obligatoire : `record ApiResponse<T>(boolean success, String
message, T data, LocalDateTime timestamp)`. Pagination obligatoire sur toute liste
(`Page<T>`, `page`/`size`/`search`/`sortBy`). Validation Bean Validation (`@NotBlank`,
`@NotEmpty`, `@Valid`) sur chaque DTO d'entrée + `@Validated` sur le controller.

## 8. JPA / Hibernate

Anti-patterns interdits : N+1 (boucle qui déclenche du lazy loading), `findAll()`
qui charge tout en mémoire sans pagination, entité exposée directement en réponse
HTTP. Utiliser projections + `Pageable` + `JOIN FETCH` explicite en JPQL.

Fetch strategy : `@OneToMany`/`@ManyToMany` restent `LAZY` (défaut) ; `@ManyToOne`
est `EAGER` par défaut → **le forcer en `LAZY` explicitement**. Détection N+1 via
`spring.jpa.properties.hibernate.generate_statistics=true`.

`BaseEntity` (`@MappedSuperclass`) pour `id`/`createdAt`/`updatedAt`/`createdBy` avec
`@EnableJpaAuditing`.

**Rappel Gamify** : le schéma n'est jamais généré par Hibernate
(`ddl-auto=validate`) — voir la règle méthodologique dans `CLAUDE.md` racine.

## 9. Sécurité Spring Security

Stateless (`SessionCreationPolicy.STATELESS`, CSRF désactivé pour API REST pure).
JWT : access token 15-30 min, refresh token 7 jours stocké en DB et révocable,
BCrypt uniquement (jamais SHA256/MD5), blocage après 5 tentatives échouées.

Checklist OWASP Top 10 à garder en tête : Broken Access Control (`@PreAuthorize` +
vérif ownership dans le service), Injection (paramétrage JPA + `@Valid`), secrets
hors code (env/Vault), pas de logs de données sensibles.

## 10. Tests

Répartition cible : 70% unitaires (JUnit 5 + Mockito + AssertJ), 20% intégration
(`@SpringBootTest` + Testcontainers), 10% E2E. Nommage
`methodName_scenario_expected`. Structure AAA (Arrange/Act/Assert), `@InjectMocks`
nommé `sut` (System Under Test).

## 11. Grille de revue — sévérités

**P0 (bloquant, merge impossible)** : violation Clean Architecture, faille de
sécurité, repository/EntityManager dans un Controller, `System.out.println`, code
qui ne compile pas, duplication > 20 lignes, endpoint GET sans pagination, `catch`
vide, secret hardcodé.

**P1 (à corriger sous 24h)** : pas de `@Valid` sur un DTO d'entrée, pas de `@Slf4j`
dans un service, pas de `@PreAuthorize` sur un controller sensible, N+1 JPA,
pas de test sur un service critique, `throw new RuntimeException("...")` non typée,
méthode > 30 lignes sans justification, fetch EAGER non justifié.

Checklist complète avant PR : compilation propre, architecture correcte, SRP/DIP
respectés, validation sur chaque DTO d'entrée, `@PreAuthorize` sur le sensible,
logging structuré, tests positifs+négatifs écrits, pagination systématique, fetch
LAZY/JOIN FETCH explicite, codes HTTP corrects, méthodes/classes sous les limites,
nommage conforme, pas de duplication > 10 lignes.
