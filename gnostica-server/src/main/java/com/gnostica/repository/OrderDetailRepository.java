package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.OrderDetail;
import com.gnostica.model.Order;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrder(Order order);
}
