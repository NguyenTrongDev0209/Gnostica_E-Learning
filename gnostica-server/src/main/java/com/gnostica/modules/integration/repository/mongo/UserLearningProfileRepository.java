package com.gnostica.modules.integration.repository.mongo;

import com.gnostica.modules.integration.model.mongo.UserLearningProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLearningProfileRepository extends MongoRepository<UserLearningProfile, String> {
    Optional<UserLearningProfile> findByAccountId(String accountId);
}
