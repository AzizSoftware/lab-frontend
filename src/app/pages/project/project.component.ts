// src/app/pages/project/project.component.ts
import { Component, OnInit } from '@angular/core';
import { ProjectService,Project } from '../../services/project-service.service';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
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

  constructor(private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.isLoggedIn = this.authService.isLoggedIn();
  }
  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;  // Update local flag after logout
  }

  // Load all projects
  loadProjects(): void {
    this.loading = true;
    this.projectService.getAllProjects().subscribe({
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

  // Filter projects by search term and status
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

  // Modal controls
  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  // Create a new project
  onSubmit(): void {
    this.newProject.startDate = new Date().toISOString();
    this.projectService.createProject(this.newProject).subscribe({
      next: () => {
        this.loadProjects();
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to create project', err);
      }
    });
  }

  // Reset the project form
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

  // Handle action buttons
  projectAction(action: string, id: string): void {
    const project = this.projects.find(p => p.id === id);
    if (!project) return;

    switch (action) {
      case 'Start':
        project.status = 'ACTIVE';
        this.projectService.updateProject(project.id!, project).subscribe(() => this.applyFilters());
        break;
      case 'Join':
        if (!project.teamMembers) project.teamMembers = [];
        project.teamMembers.push('New Member'); // Replace with actual user ID
        this.projectService.updateProject(project.id!, project).subscribe(() => this.applyFilters());
        break;
      case 'View':
      case 'Details':
        alert(`Project Details:\n\n${project.projectName}\nStatus: ${project.status}\nBudget: $${project.budget}`);
        break;
      default:
        console.warn('Unknown action', action);
    }
  }

  // Delete project
  deleteProject(id: string): void {
    if (!confirm('Are you sure you want to delete this project?')) return;

    this.projectService.deleteProject(id).subscribe({
    next: () => this.loadProjects(),
    error: (err: any) => console.error('Failed to delete project', err)
  });
  }
}
