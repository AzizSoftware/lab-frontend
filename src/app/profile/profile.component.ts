import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { UserService,User,FileDocument } from '../services/user-service.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // User data
  user: User | null = null;
  isOwnProfile = false;
  
  // UI state
  editMode = false;
  showUploadForm = false;
  showPhotoUpload = false;
  isLoading = false;
  isUploading = false;
  
  // Forms
    profileForm!: FormGroup;
    uploadForm!: FormGroup;
  // File handling
  selectedFile: File | null = null;
  selectedPhotoFile: File | null = null;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialization Methods
  private initializeForms(): void {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      grade: ['', Validators.required],
      institute: ['', [Validators.required, Validators.minLength(3)]],
      lastDiploma: ['', Validators.required],
      researchArea: ['', [Validators.required, Validators.minLength(10)]],
      linkedInUrl: ['', Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)]
    });

    this.uploadForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      authors: ['', Validators.required],
      affiliations: ['', Validators.required],
      publicationDate: ['', Validators.required],
      abstractText: ['', [Validators.required, Validators.minLength(50)]],
      keywords: ['', Validators.required],
      doi: ['']
    });
  }

  // Data Loading Methods
  private loadUserProfile(): void {
    this.isLoading = true;
    
    // Get email from route params or current user
    const emailFromRoute = this.route.snapshot.paramMap.get('email');
    const currentUserEmail = this.userService.getUserEmail();
    
    if (emailFromRoute) {
      this.isOwnProfile = emailFromRoute === currentUserEmail;
      this.loadUserByEmail(emailFromRoute);
    } else if (currentUserEmail) {
      this.isOwnProfile = true;
      this.loadUserByEmail(currentUserEmail);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private loadUserByEmail(email: string): void {
    this.userService.getUserByEmail(email)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          this.populateProfileForm();
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.router.navigate(['/dashboard']);
        }
      });
  }

  private populateProfileForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phone: this.user.phone,
        grade: this.user.grade,
        institute: this.user.institute,
        lastDiploma: this.user.lastDiploma,
        researchArea: this.user.researchArea,
        linkedInUrl: this.user.linkedInUrl || ''
      });
    }
  }

  // Edit Mode Methods
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.populateProfileForm();
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.populateProfileForm();
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      const formData = this.profileForm.value;
      
      this.userService.updateUser(this.user.email, formData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (updatedUser) => {
            this.user = updatedUser;
            this.editMode = false;
            this.showSuccessMessage('Profile updated successfully!');
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.showErrorMessage('Failed to update profile. Please try again.');
          }
        });
    }
  }

  // Photo Upload Methods
  togglePhotoUpload(): void {
    this.showPhotoUpload = !this.showPhotoUpload;
    this.selectedPhotoFile = null;
  }

  onPhotoSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showErrorMessage('Please select a valid image file.');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.showErrorMessage('Image file size must be less than 5MB.');
        return;
      }
      
      this.selectedPhotoFile = file;
      this.uploadPhoto();
    }
  }

  private uploadPhoto(): void {
    if (this.selectedPhotoFile && this.user) {
      this.isLoading = true;
      
      this.userService.uploadProfilePhoto(this.user.email, this.selectedPhotoFile)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isLoading = false;
            this.showPhotoUpload = false;
            this.selectedPhotoFile = null;
          })
        )
        .subscribe({
          next: (updatedUser) => {
            this.user = updatedUser;
            this.showSuccessMessage('Profile photo updated successfully!');
          },
          error: (error) => {
            console.error('Error uploading photo:', error);
            this.showErrorMessage('Failed to upload photo. Please try again.');
          }
        });
    }
  }

  // Document Upload Methods
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        this.showErrorMessage('Please select a valid document file (PDF, DOC, DOCX, TXT).');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.showErrorMessage('Document file size must be less than 10MB.');
        return;
      }
      
      this.selectedFile = file;
    }
  }

  onFileUpload(): void {
    if (this.uploadForm.valid && this.selectedFile && this.user) {
      this.isUploading = true;
      
      const formData = this.uploadForm.value;
      const fileMetadata = {
        title: formData.title,
        authors: this.parseCommaSeparatedList(formData.authors),
        affiliations: this.parseCommaSeparatedList(formData.affiliations),
        publicationDate: formData.publicationDate,
        abstractText: formData.abstractText,
        keywords: this.parseCommaSeparatedList(formData.keywords),
        doi: formData.doi || undefined
      };
      
      this.userService.uploadFile(this.user.email, this.selectedFile, fileMetadata)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isUploading = false)
        )
        .subscribe({
          next: (updatedUser) => {
            this.user = updatedUser;
            this.resetUploadForm();
            this.showSuccessMessage('Document uploaded successfully!');
          },
          error: (error) => {
            console.error('Error uploading document:', error);
            this.showErrorMessage('Failed to upload document. Please try again.');
          }
        });
    }
  }

  private parseCommaSeparatedList(input: string): string[] {
    return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  private resetUploadForm(): void {
    this.uploadForm.reset();
    this.selectedFile = null;
    this.showUploadForm = false;
  }

  // File Download Method
  downloadFile(filename: string): void {
    this.userService.downloadFile(filename)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading file:', error);
          this.showErrorMessage('Failed to download file. Please try again.');
        }
      });
  }

  // Utility Methods
  formatUserName(user: User | null): string {
    if (!user) return '';
    return this.userService.formatUserName(user);
  }

  getUserStatusColor(status: string | undefined): string {
    if (!status) return '#95a5a6';
    return this.userService.getUserStatusColor(status);
  }

  getUserRoleDisplay(role: string | undefined): string {
    if (!role) return 'User';
    return this.userService.getUserRoleDisplay(role);
  }

  getUserRoleColor(role: string | undefined): string {
    if (!role) return '#6b7280';
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN': return '#dc2626';
      case 'ADMIN': return '#ea580c';
      case 'USER': return '#2563eb';
      default: return '#6b7280';
    }
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  }

  // Message Methods
  private showSuccessMessage(message: string): void {
    // Implement your preferred notification system here
    console.log('Success:', message);
    // Example: this.notificationService.showSuccess(message);
  }

  private showErrorMessage(message: string): void {
    // Implement your preferred notification system here
    console.error('Error:', message);
    // Example: this.notificationService.showError(message);
  }
}