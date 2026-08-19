package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
