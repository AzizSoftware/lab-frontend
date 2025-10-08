import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../services/project-service.service';
import { EventService } from '../../../services/event-service.service';
import { UserService } from '../../../services/user-service.service';
import { FileService } from '../../../services/file-service.service';
import { AdminService } from '../../../services/admin-service.service';
import { Project, Event, User, FileDocument, RoleEnum, SignupRequest } from '../../../services/models';


@Component({
  selector: 'app-admin-console',
  templateUrl: './admin-console.component.html',
  styleUrls: ['./admin-console.component.css'],
  
})
export class AdminConsoleComponent implements OnInit {
  projects: Project[] = [];
  events: Event[] = [];
  users: User[] = [];
  files: FileDocument[] = [];
  projectColumns: string[] = ['projectName', 'description', 'status', 'actions'];
  eventColumns: string[] = ['eventName', 'startDate', 'status', 'actions'];
  userColumns: string[] = ['username', 'email', 'role', 'status', 'actions'];
  fileColumns: string[] = ['title', 'authors', 'fileType', 'actions'];

  isProjectModalOpen: boolean = false;
  isEventModalOpen: boolean = false;
  isUserModalOpen: boolean = false;
  isFileModalOpen: boolean = false;

  selectedProject: Project | null = null;
  selectedEvent: Event | null = null;
  selectedUser: User | null = null;
  selectedFile: FileDocument | null = null;
  selectedUploadFile: File | null = null;

  projectForm: FormGroup;
  eventForm: FormGroup;
  userForm: FormGroup;
  fileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private eventService: EventService,
    private userService: UserService,
    private fileService: FileService,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      budget: [0, [Validators.required, Validators.min(1)]],
      maxTeamMembers: [0, [Validators.required, Validators.min(1)]]
    });

    this.eventForm = this.fb.group({
      eventName: ['', Validators.required],
      location: ['', Validators.required],
      budget: [0, [Validators.required, Validators.min(1)]],
      maxParticipants: [0, [Validators.required, Validators.min(1)]],
      availablePlaces: [0, [Validators.required, Validators.min(0)]],
      status: ['', Validators.required],
      image: [''],
      imagePath: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      enrolledUsers: [[]],
      createdAt: ['']
    }, { validators: this.dateRangeValidator });

    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      status: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      phone: ['', Validators.required],
      grade: ['', Validators.required],
      institute: ['', Validators.required],
      lastDiploma: ['', Validators.required],
      researchArea: ['', Validators.required]
    });

    this.fileForm = this.fb.group({
      title: ['', Validators.required],
      authors: ['', Validators.required],
      affiliations: [''],
      keywords: ['', Validators.required],
      publicationDate: ['', Validators.required],
      abstractText: ['', Validators.required],
      doi: [''],
      fileType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadEvents();
    this.loadUsers();
    this.loadFiles();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private dateRangeValidator(form: FormGroup): { [key: string]: any } | null {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  debugForm(): void {
    console.log('Event Form Valid:', this.eventForm.valid);
    console.log('Event Form Errors:', this.eventForm.errors);
    console.log('Event Form Value:', this.eventForm.value);
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => this.showError('Failed to load projects')
    });
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (data) => this.events = data,
      error: (err) => this.showError('Failed to load events')
    });
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => this.showError('Failed to load users')
    });
  }

  loadFiles(): void {
    this.fileService.getAllFiles().subscribe({
      next: (data) => this.files = data,
      error: (err) => this.showError('Failed to load files')
    });
  }

  openProjectModal(project?: Project): void {
    this.selectedProject = project || null;
    if (project) {
      this.projectForm.patchValue(project);
    } else {
      this.projectForm.reset();
    }
    this.isProjectModalOpen = true;
  }

  closeProjectModal(): void {
    this.isProjectModalOpen = false;
  }

  saveProject(): void {
    if (this.projectForm.valid) {
      const project: Project = this.projectForm.value;
      if (this.selectedProject && this.selectedProject.id) {
        this.projectService.updateProject(this.selectedProject.id, project).subscribe({
          next: () => {
            this.loadProjects();
            this.closeProjectModal();
            this.snackBar.open('Project updated successfully', 'Close', { duration: 2000 });
          },
          error: (err) => this.showError('Failed to update project: ' + err.message)
        });
      } else {
        this.projectService.createProject(project).subscribe({
          next: () => {
            this.loadProjects();
            this.closeProjectModal();
            this.snackBar.open('Project created successfully', 'Close', { duration: 2000 });
          },
          error: (err) => this.showError('Failed to create project: ' + err.message)
        });
      }
    } else {
      this.showError('Please fill all required fields correctly');
    }
  }

  deleteProject(id: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects();
          this.snackBar.open('Project deleted successfully', 'Close', { duration: 2000 });
        },
        error: (err) => this.showError('Failed to delete project')
      });
    }
  }

  openEventModal(event?: Event): void {
    this.selectedEvent = event || null;
    if (event) {
      this.eventForm.patchValue({
        ...event,
        startDate: event.startDate ? event.startDate.split('T')[0] : '',
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        enrolledUsers: event.enrolledUsers || [],
        createdAt: event.createdAt || ''
      });
    } else {
      this.eventForm.reset({
        budget: 0,
        maxParticipants: 0,
        availablePlaces: 0,
        image: '',
        imagePath: '',
        enrolledUsers: [],
        createdAt: ''
      });
    }
    this.isEventModalOpen = true;
  }

  closeEventModal(): void {
    this.isEventModalOpen = false;
  }

  saveEvent(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      // Construct Event object, ensuring all required fields are provided
      const eventData: Event = {
        eventName: formValue.eventName,
        location: formValue.location,
        budget: formValue.budget,
        maxParticipants: formValue.maxParticipants,
        availablePlaces: formValue.availablePlaces ?? formValue.maxParticipants, // Default to maxParticipants if null
        status: formValue.status,
        image: formValue.image || undefined,
        imagePath: formValue.imagePath || undefined,
        startDate: formValue.startDate ? `${formValue.startDate}T00:00:00` : '',
        endDate: formValue.endDate ? `${formValue.endDate}T00:00:00` : '',
        description: formValue.description
        // enrolledUsers and createdAt are managed by the backend, omitted here
      };

      if (this.selectedEvent && this.selectedEvent.id) {
        this.eventService.updateEvent(this.selectedEvent.id, eventData).subscribe({
          next: () => {
            this.loadEvents();
            this.closeEventModal();
            this.snackBar.open('Event updated successfully', 'Close', { duration: 2000 });
          },
          error: (err) => {
            this.showError('Failed to update event: ' + err.message);
            this.debugForm();
          }
        });
      } else {
        this.eventService.createEvent(eventData).subscribe({
          next: () => {
            this.loadEvents();
            this.closeEventModal();
            this.snackBar.open('Event created successfully', 'Close', { duration: 2000 });
          },
          error: (err) => {
            this.showError('Failed to create event: ' + err.message);
            this.debugForm();
          }
        });
      }
    } else {
      this.showError('Please fill all required fields correctly');
      this.debugForm();
    }
  }
  deleteEvent(id: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.loadEvents();
          this.snackBar.open('Event deleted successfully', 'Close', { duration: 2000 });
        },
        error: (err) => this.showError('Failed to delete event')
      });
    }
  }

  openUserModal(user?: User): void {
    this.selectedUser = user || null;
    if (user) {
      this.userForm.patchValue(user);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.reset();
    }
    this.isUserModalOpen = true;
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const userData: Partial<User> = {
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        email: this.userForm.value.email,
        dateOfBirth: this.userForm.value.dateOfBirth,
        phone: this.userForm.value.phone,
        grade: this.userForm.value.grade,
        institute: this.userForm.value.institute,
        lastDiploma: this.userForm.value.lastDiploma,
        researchArea: this.userForm.value.researchArea,
        role: this.userForm.value.role,
        status: this.userForm.value.status
      };

      if (this.selectedUser && this.selectedUser.id && this.selectedUser.email) {
        console.log('Updating user with email:', this.selectedUser.email);
        this.userService.updateUser(this.selectedUser.email, userData).subscribe({
          next: (updatedUser) => {
            if (userData.role) {
              this.userService.updateUserRole(this.selectedUser!.email, userData.role).subscribe({
                next: () => {
                  this.loadUsers();
                  this.closeUserModal();
                  this.snackBar.open('User updated successfully', 'Close', { duration: 2000 });
                },
                error: (err) => {
                  const message = err.status === 404 ? 'User not found in the database' : `Failed to update user role: ${err.message}`;
                  this.showError(message);
                  this.debugForm();
                }
              });
            } else {
              this.loadUsers();
              this.closeUserModal();
              this.snackBar.open('User updated successfully', 'Close', { duration: 2000 });
            }
          },
          error: (err) => {
            const message = err.status === 404 ? 'User not found in the database' : `Failed to update user: ${err.message}`;
            this.showError(message);
            this.debugForm();
          }
        });
      } else {
        const signupData: SignupRequest = {
          ...userData,
          password: this.userForm.value.password
        } as SignupRequest;
        this.userService.signup(signupData).subscribe({
          next: () => {
            this.loadUsers();
            this.closeUserModal();
            this.snackBar.open('User created successfully', 'Close', { duration: 2000 });
          },
          error: (err) => {
            const message = err.status === 400 ? 'Email already in use' : `Failed to create user: ${err.message}`;
            this.showError(message);
            this.debugForm();
          }
        });
      }
    } else {
      this.showError('Please fill all required fields correctly');
      this.debugForm();
    }
  }
  approveUser(email: string): void {
    if (confirm('Are you sure you want to approve this user?')) {
      this.adminService.approveUserByEmail(email, RoleEnum.PERMANENT).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('User approved successfully', 'Close', { duration: 2000 });
        },
        error: (err) => this.showError('Failed to approve user')
      });
    }
  }

  declineUser(email: string): void {
    if (confirm('Are you sure you want to decline this user?')) {
      this.adminService.declineUserByEmail(email).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('User declined successfully', 'Close', { duration: 2000 });
        },
        error: (err) => this.showError('Failed to decline user')
      });
    }
  }

  openFileModal(file?: FileDocument): void {
    this.selectedFile = file || null;
    if (file) {
      this.fileForm.patchValue({
        ...file,
        authors: file.authors?.join(', '),
        keywords: file.keywords?.join(', '),
        affiliations: file.affiliations?.join(', ')
      });
    } else {
      this.fileForm.reset();
    }
    this.isFileModalOpen = true;
  }

  closeFileModal(): void {
    this.isFileModalOpen = false;
    this.selectedUploadFile = null;
  }

  onFileChange(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedUploadFile = input.files[0];
    }
  }

  saveFile(): void {
    if (this.fileForm.valid) {
      const fileData: Partial<FileDocument> = {
        ...this.fileForm.value,
        authors: this.fileForm.value.authors.split(',').map((author: string) => author.trim()),
        keywords: this.fileForm.value.keywords.split(',').map((keyword: string) => keyword.trim()),
        affiliations: this.fileForm.value.affiliations
          ? this.fileForm.value.affiliations.split(',').map((aff: string) => aff.trim())
          : []
      };

      if (this.selectedFile && this.selectedFile.id) {
        this.fileService.updateFile(this.selectedFile.id, fileData).subscribe({
          next: () => {
            this.loadFiles();
            this.closeFileModal();
            this.snackBar.open('File updated successfully', 'Close', { duration: 2000 });
          },
          error: (err) => this.showError('Failed to update file')
        });
      } else if (this.selectedUploadFile) {
        const email = localStorage.getItem('userEmail') || 'default@example.com';
        this.fileService.uploadFile(email, this.selectedUploadFile, fileData).subscribe({
          next: () => {
            this.loadFiles();
            this.closeFileModal();
            this.snackBar.open('File uploaded successfully', 'Close', { duration: 2000 });
          },
          error: (err) => this.showError('Failed to upload file')
        });
      } else {
        this.showError('No file selected for upload');
      }
    } else {
      this.showError('Please fill all required fields');
    }
  }
}