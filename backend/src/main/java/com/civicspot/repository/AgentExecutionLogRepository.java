package com.civicspot.repository;

import com.civicspot.model.AgentExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentExecutionLogRepository extends JpaRepository<AgentExecutionLog, Long> {
    List<AgentExecutionLog> findBySessionIdOrderByTimestampAsc(String sessionId);
    List<AgentExecutionLog> findAllByOrderByTimestampDesc();
}
