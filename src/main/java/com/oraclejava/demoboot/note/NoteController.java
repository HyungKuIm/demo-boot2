package com.oraclejava.demoboot.note;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/notes")
public class NoteController {

	private final NoteService noteService;

	public NoteController(NoteService noteService) {
		this.noteService = noteService;
	}

	@GetMapping
	public List<Note> list() {
		return noteService.findAll();
	}

	@GetMapping("/{id}")
	public Note get(@PathVariable Long id) {
		return noteService.findById(id).orElseThrow(() -> notFound(id));
	}

	@PostMapping
	public ResponseEntity<Note> create(@RequestBody NoteRequest request) {
		validate(request);
		Note note = noteService.create(request);
		return ResponseEntity.created(URI.create("/notes/" + note.id())).body(note);
	}

	@PutMapping("/{id}")
	public Note update(@PathVariable Long id, @RequestBody NoteRequest request) {
		validate(request);
		return noteService.update(id, request).orElseThrow(() -> notFound(id));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		if (!noteService.delete(id)) {
			throw notFound(id);
		}
		return ResponseEntity.noContent().build();
	}

	private static void validate(NoteRequest request) {
		if (request.title() == null || request.title().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title must not be blank");
		}
	}

	private static ResponseStatusException notFound(Long id) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, "Note " + id + " not found");
	}

}
