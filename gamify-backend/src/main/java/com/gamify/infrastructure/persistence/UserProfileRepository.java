package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Clé primaire partagée avec {@code users} (@MapsId côté UserProfile) :
 * {@code findById(user.getId())} suffit pour retrouver le profil d'un user,
 * pas besoin de méthode dérivée {@code findByUserId}.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
