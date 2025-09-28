import { Component, OnInit } from '@angular/core';
import { FileService,FileDocument } from '../../services/file-service.service';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth-service.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {
  isLoggedIn: boolean = false;
  files: FileDocument[] = [];
  filteredFiles: FileDocument[] = [];
  loading = true;
  errorMessage = '';

  // Properties for two-way data binding
  searchTitle: string = '';
  searchKeyword: string = '';
  searchAuthor: string = '';
  searchDateAfter: string = '';
  searchDateBefore: string = '';

  // Property for the modal state
  isModalOpen: boolean = false;

  newFile: FileDocument = {
    title: '',
    keyword: '',
    author: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD
    description: ''
  };

  constructor(
    private fileService: FileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchFiles();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
  }

  fetchFiles(): void {
    this.loading = true;
    this.fileService.getAllFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.filteredFiles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load files';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loading = true;
    this.errorMessage = '';

    // Determine which service calls to make
    const searchByTitle$ = this.searchTitle
      ? this.fileService.findByTitle(this.searchTitle)
      : of(this.files);

    const searchByKeyword$ = this.searchKeyword
      ? this.fileService.findByKeyword(this.searchKeyword)
      : of(this.files);

    const searchByAuthor$ = this.searchAuthor
      ? this.fileService.findByAuthor(this.searchAuthor)
      : of(this.files);

    const searchByDateAfter$ = this.searchDateAfter
      ? this.fileService.findByDateAfter(this.searchDateAfter)
      : of(this.files);

    const searchByDateBefore$ = this.searchDateBefore
      ? this.fileService.findByDateBefore(this.searchDateBefore)
      : of(this.files);

    // Combine results using forkJoin
    forkJoin([searchByTitle$, searchByKeyword$, searchByAuthor$, searchByDateAfter$, searchByDateBefore$])
      .pipe(
        catchError(err => {
          this.errorMessage = 'Search failed.';
          this.loading = false;
          return of([[], [], [], [], []]);
        })
      )
      .subscribe(([titleFiles, keywordFiles, authorFiles, dateAfterFiles, dateBeforeFiles]) => {
        // Intersect results: Keep files that match all non-empty filters
        let finalFiles = this.files;

        if (this.searchTitle) {
          finalFiles = finalFiles.filter(file => titleFiles.some(f => f.id === file.id));
        }
        if (this.searchKeyword) {
          finalFiles = finalFiles.filter(file => keywordFiles.some(f => f.id === file.id));
        }
        if (this.searchAuthor) {
          finalFiles = finalFiles.filter(file => authorFiles.some(f => f.id === file.id));
        }
        if (this.searchDateAfter) {
          finalFiles = finalFiles.filter(file => dateAfterFiles.some(f => f.id === file.id));
        }
        if (this.searchDateBefore) {
          finalFiles = finalFiles.filter(file => dateBeforeFiles.some(f => f.id === file.id));
        }

        this.filteredFiles = finalFiles;
        this.loading = false;

        if (this.filteredFiles.length === 0) {
          this.errorMessage = 'No files found matching your criteria.';
        } else {
          this.errorMessage = '';
        }
      });

    // Reset to all files if no filters are applied
    if (!this.searchTitle && !this.searchKeyword && !this.searchAuthor && !this.searchDateAfter && !this.searchDateBefore) {
      this.filteredFiles = this.files;
      this.errorMessage = '';
      this.loading = false;
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onSubmit(): void {
    this.fileService.createFile(this.newFile).subscribe({
      next: (createdFile) => {
        this.files.push(createdFile);
        this.filteredFiles.push(createdFile);
        this.newFile = {
          title: '',
          keyword: '',
          author: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        };
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to create file:', err);
        this.errorMessage = 'Failed to create file';
      }
    });
  }

  fileAction(action: string, id: string | undefined): void {
    console.log(`Action: ${action} requested for File ID: ${id}`);
    // Future logic: e.g., download file, view details, delete
  }
}