package com.gamify.application.services;

import com.gamify.application.dtos.backoffice.AdminUserStatsResponse;
import com.gamify.application.dtos.backoffice.UserRankResponse;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public Page<UserRankResponse> ranking(Pageable pageable, String search) {
        Page<UserProfile> page = (search != null && !search.isBlank())
                ? userProfileRepository.searchByUsernameOrEmail(search.trim(), pageable)
                : userProfileRepository.findAll(pageable);

        // Un seul aller supplémentaire pour résoudre les usernames (credentials)
        // plutôt qu'un accès lazy profile.getUser() par ligne (N+1).
        List<Long> ids = page.getContent().stream().map(UserProfile::getId).toList();
        Map<Long, String> usernames = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        int rang = pageable.getPageNumber() * pageable.getPageSize() + 1;
        List<UserRankResponse> classement = new ArrayList<>();
        for (UserProfile profile : page.getContent()) {
            classement.add(toRankResponse(profile, usernames.get(profile.getId()), rang++));
        }
        return new PageImpl<>(classement, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public AdminUserStatsResponse stats() {
        return new AdminUserStatsResponse(userRepository.count());
    }

    private UserRankResponse toRankResponse(UserProfile profile, String username, int rang) {
        return new UserRankResponse(profile.getId(), username, profile.getNiveau(), profile.getXpTotal(), rang);
    }
}
