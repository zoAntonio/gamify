package com.gamify.application.services;

import com.gamify.application.dtos.backoffice.AdminUserStatsResponse;
import com.gamify.application.dtos.backoffice.UserRankResponse;
import com.gamify.domain.entities.User;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<UserRankResponse> ranking(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);

        int rang = pageable.getPageNumber() * pageable.getPageSize() + 1;
        List<UserRankResponse> classement = new ArrayList<>();
        for (User user : page.getContent()) {
            classement.add(toRankResponse(user, rang++));
        }
        return new PageImpl<>(classement, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public AdminUserStatsResponse stats() {
        return new AdminUserStatsResponse(userRepository.count());
    }

    private UserRankResponse toRankResponse(User user, int rang) {
        return new UserRankResponse(user.getId(), user.getUsername(), user.getNiveau(), user.getXpTotal(), rang);
    }
}
