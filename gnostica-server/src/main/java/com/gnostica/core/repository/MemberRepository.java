package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
}

