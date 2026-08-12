-- Flyway Migration V3: Messaging MVP Tables (Conversations, Conversation Participants, Messages)

-- 1. Table: conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    student_id UUID NOT NULL REFERENCES accounts(id),
    instructor_id UUID NOT NULL REFERENCES accounts(id),
    last_message_id UUID,
    last_message_text VARCHAR(1000),
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_conversations_course_student_instructor UNIQUE (course_id, student_id, instructor_id)
);

-- 2. Table: conversation_participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    role VARCHAR(20) NOT NULL,
    last_read_message_id UUID,
    last_read_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_conversation_participant UNIQUE (conversation_id, account_id)
);

-- 3. Table: messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES accounts(id),
    client_message_id UUID,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_sender_client_message_id UNIQUE (sender_id, client_message_id)
);

-- 4. Foreign Keys pointing to messages(id)
ALTER TABLE conversations
    ADD CONSTRAINT fk_conversations_last_message
    FOREIGN KEY (last_message_id) REFERENCES messages(id);

ALTER TABLE conversation_participants
    ADD CONSTRAINT fk_cp_last_read_message
    FOREIGN KEY (last_read_message_id) REFERENCES messages(id);

-- 5. Indexes
CREATE INDEX idx_conversations_course ON conversations(course_id);
CREATE INDEX idx_conversations_last_msg_at ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX idx_cp_account_conv ON conversation_participants(account_id, conversation_id);
CREATE INDEX idx_messages_conv_cursor ON messages(conversation_id, created_at DESC, id DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
