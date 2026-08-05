package com.gnostica;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.gnostica.core.repository.AccountRepository;
import java.util.Arrays;
import org.springframework.data.domain.PageRequest;
import com.gnostica.core.model.Account;

@SpringBootTest
public class TestQuery {
    @Autowired
    private AccountRepository accountRepository;

    @Test
    public void test() {
        var page = accountRepository.searchAccounts(false, Arrays.asList("USER", "ROLE_USER"), false, "", Arrays.asList(-1), PageRequest.of(0, 10));
        System.out.println("====== TEST QUERY RESULTS ======");
        System.out.println("TOTAL ELEMENTS: " + page.getTotalElements());
        System.out.println("CONTENT SIZE: " + page.getContent().size());
        for (Account acc : page.getContent()) {
            System.out.println("ROLE: " + acc.getRole().getName() + " NAME: " + acc.getFullName());
        }
        System.out.println("================================");
    }
}
