package com.gnostica.modules.integration.repository.mongo;

import com.gnostica.modules.integration.model.mongo.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends MongoRepository<ChatSession, String> {
    List<ChatSession> findAllByAccountIdOrderByUpdatedAtDesc(String accountId);
}
