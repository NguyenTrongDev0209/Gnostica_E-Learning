package com.gnostica.modules.settings.dto.response;
import com.gnostica.core.model.TermModule; import lombok.*; import java.util.*;
@Data @Builder public class TermModuleResponse { private Integer id,sortOrder,status; private String title; private Map<String,Object> metadata; private List<TermResponse> terms; public static TermModuleResponse from(TermModule m,List<TermResponse> terms){return builder().id(m.getId()).title(m.getTitle()).sortOrder(m.getSortOrder()).status(m.getStatus()).metadata(m.getMetadata()).terms(terms).build();} }
