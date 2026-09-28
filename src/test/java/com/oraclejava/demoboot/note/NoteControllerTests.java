package com.oraclejava.demoboot.note;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class NoteControllerTests {

	@Autowired
	private WebApplicationContext context;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void crudFlow() throws Exception {
		String location = mockMvc.perform(post("/notes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"title\":\"first\",\"content\":\"hello\"}"))
				.andExpect(status().isCreated())
				.andExpect(header().exists("Location"))
				.andExpect(jsonPath("$.title").value("first"))
				.andReturn().getResponse().getHeader("Location");

		mockMvc.perform(get(location))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content").value("hello"));

		mockMvc.perform(put(location)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"title\":\"updated\",\"content\":\"world\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("updated"));

		mockMvc.perform(get("/notes"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.title == 'updated')]").exists());

		mockMvc.perform(delete(location))
				.andExpect(status().isNoContent());

		mockMvc.perform(get(location))
				.andExpect(status().isNotFound());
	}

	@Test
	void blankTitleIsRejected() throws Exception {
		mockMvc.perform(post("/notes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"title\":\" \",\"content\":\"x\"}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void missingNoteReturns404() throws Exception {
		mockMvc.perform(put("/notes/9999")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"title\":\"t\",\"content\":\"c\"}"))
				.andExpect(status().isNotFound());
		mockMvc.perform(delete("/notes/9999"))
				.andExpect(status().isNotFound());
	}

}
