package com.oraclejava.demoboot.note;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NoteService {

	private final NoteRepository noteRepository;

	public NoteService(NoteRepository noteRepository) {
		this.noteRepository = noteRepository;
	}

	public List<Note> findAll() {
		return noteRepository.findAll(Sort.by("id"));
	}

	public Optional<Note> findById(Long id) {
		return noteRepository.findById(id);
	}

	@Transactional
	public Note create(NoteRequest request) {
		return noteRepository.save(new Note(request.title(), request.content()));
	}

	@Transactional
	public Optional<Note> update(Long id, NoteRequest request) {
		return noteRepository.findById(id).map(note -> {
			note.update(request.title(), request.content());
			return noteRepository.saveAndFlush(note);
		});
	}

	@Transactional
	public boolean delete(Long id) {
		if (!noteRepository.existsById(id)) {
			return false;
		}
		noteRepository.deleteById(id);
		return true;
	}

}
