import { Component, OnInit } from '@angular/core';
import { ProjectService, Project } from '../../services/project-service.service';
import { AuthService } from '../../services/auth-service.service';
import { UserService, User } from '../../services/user-service.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar
  
 } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  private destroy$ = new Subject<void>();
  isLoggedIn: boolean = false;
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  newProject: Project = {
    projectName: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    budget: 0,
    maxTeamMembers: 0,
    teamMembers: [],
    imagePath: 'assets/default-project.jpg'
  };
  searchTerm: string = '';
  selectedProjectStatus: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  isModalOpen: boolean = false;
  currentUserId: string | null = null;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const userEmail = this.userService.getUserEmail();
      if (userEmail) {
        this.userService.getUserByEmail(userEmail)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (user: User) => {
              this.currentUserId = user.id;
            },
            error: (err) => {
              console.error('Failed to fetch user ID', err);
              this.errorMessage = 'Failed to load user data';
            }
          });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUserId = null;
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getAllProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.filteredProjects = [...this.projects];
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load projects';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = this.searchTerm
        ? project.projectName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          project.status.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchesStatus = this.selectedProjectStatus
        ? project.status === this.selectedProjectStatus
        : true;

      return matchesSearch && matchesStatus;
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  onSubmit(): void {
    this.newProject.startDate = new Date().toISOString();
    this.projectService.createProject(this.newProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadProjects();
          this.closeModal();
          this.showSuccessMessage('Project created successfully');
        },
        error: (err) => {
          console.error('Failed to create project', err);
          this.errorMessage = 'Failed to create project';
        }
      });
  }

  resetForm(): void {
    this.newProject = {
      projectName: '',
      description: '',
      status: 'ACTIVE',
      startDate: '',
      endDate: '',
      budget: 0,
      maxTeamMembers: 0,
      teamMembers: [],
      imagePath: 'assets/default-project.jpg'
    };
  }

  projectAction(action: string, id: string): void {
    const project = this.projects.find(p => p.id === id);
    if (!project) {
      this.errorMessage = 'Project not found';
      return;
    }

    switch (action) {
      case 'Start':
        project.status = 'ACTIVE';
        this.projectService.updateProject(project.id!, project)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.applyFilters();
              this.showSuccessMessage(`Project ${project.projectName} started`);
            },
            error: (err) => {
              console.error('Failed to update project', err);
              this.errorMessage = 'Failed to start project';
            }
          });
        break;
      case 'Join':
        const userEmail = this.userService.getUserEmail();
        if (!userEmail) {
          this.errorMessage = 'Please log in to join a project';
          return;
        }
        this.userService.getUserByEmail(userEmail)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (user: User) => {
              this.projectService.addTeamMember(project.id!, user.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (updatedProject) => {
                    this.loadProjects();
                    this.showSuccessMessage(`Successfully joined ${project.projectName}`);
                  },
                  error: (err) => {
                    console.error('Failed to join project', err);
                    this.errorMessage = err.error || 'Failed to join project. You may already be enrolled or no spots are available.';
                  }
                });
            },
            error: (err) => {
              console.error('Failed to fetch user', err);
              this.errorMessage = 'Failed to fetch user data';
            }
          });
        break;
      case 'Details':
        this.snackBar.open(`Project Details:\n${project.projectName}\nStatus: ${project.status}\nBudget: $${project.budget}\nSpots: ${project.availableSpots}/${project.maxTeamMembers}`, 'Close', {
          duration: 5000,
          verticalPosition: 'top'
        });
        break;
      default:
        console.warn('Unknown action', action);
    }
  }

  deleteProject(id: string): void {
    if (!confirm('Are you sure you want to delete this project?')) return;

    this.projectService.deleteProject(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadProjects();
          this.showSuccessMessage('Project deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete project', err);
          this.errorMessage = 'Failed to delete project';
        }
      });
  }

  isUserEnrolled(project: Project): boolean {
    if (!this.currentUserId || !project.teamMembers) return false;
    return project.teamMembers.includes(this.currentUserId);
  }

  showSuccessMessage(message: string): void {
    this.errorMessage = '';
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}