package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Clé primaire partagée avec {@code users} (@MapsId côté UserProfile) :
 * {@code findById(user.getId())} suffit pour retrouver le profil d'un user,
 * pas besoin de méthode dérivée {@code findByUserId}.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    /**
     * Utilisé par le job de pénalités d'inactivité (parcourt tous les profils) :
     * {@code user} est chargé en JOIN FETCH pour éviter un N+1 (un accès LAZY par
     * profil pour renseigner {@code ProgressionLog.user}).
     */
    @Query("SELECT p FROM UserProfile p JOIN FETCH p.user")
    List<UserProfile> findAllWithUser();

    /**
     * Classement social (G2-T17) : uniquement les profils opt-in
     * ({@code profilPublic = true}), triés selon le {@code Sort} porté par le
     * {@code Pageable} (xpTotal/niveau/un des 6 attributs, voir
     * {@code SocialService.champPour}) — même patron que
     * {@code AdminUserService.ranking} (qui, lui, voit tout le monde).
     */
    Page<UserProfile> findByProfilPublicTrue(Pageable pageable);

    /**
     * Recherche admin (`/api/backoffice/users?search=`) : username/email vivent
     * sur {@link com.gamify.domain.entities.User}, d'où le JOIN (pas FETCH — le
     * username est de toute façon résolu séparément par
     * {@code AdminUserService.ranking}, même patron anti-N+1 que la méthode sans
     * recherche). Insensible à la casse, recherche partielle (contient).
     */
    @Query("SELECT p FROM UserProfile p JOIN p.user u "
            + "WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<UserProfile> searchByUsernameOrEmail(@Param("search") String search, Pageable pageable);
}
