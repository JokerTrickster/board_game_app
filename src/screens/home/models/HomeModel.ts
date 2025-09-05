import { DomainModel, ModelValidationError, BusinessRule } from '../../../infrastructure/mvvm/BaseModel';

/**
 * Game item data structure
 */
export interface GameItem {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  playerCount: {
    min: number;
    max: number;
  };
  playTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
}

/**
 * User profile data for home screen
 */
export interface HomeUserProfile {
  userID: number;
  name: string;
  email: string;
  profileImage: string | null;
  level: number;
  experience: number;
  totalGamesPlayed: number;
  favoriteGames: number[];
  achievements: Achievement[];
}

/**
 * Achievement data structure
 */
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

/**
 * Home screen statistics
 */
export interface HomeStats {
  totalUsers: number;
  activeGames: number;
  todayGames: number;
  weeklyRanking: number | null;
}

/**
 * App notification data
 */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

/**
 * Quick action item
 */
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  route: string;
  params?: any;
  isEnabled: boolean;
  badge?: number;
}

/**
 * Domain model for Home screen state and data
 */
export class HomeModel extends DomainModel {
  // User data
  public userProfile: HomeUserProfile | null = null;
  public isProfileLoaded: boolean = false;

  // Game data
  public gameList: GameItem[] = [];
  public featuredGames: GameItem[] = [];
  public recentlyPlayedGames: GameItem[] = [];
  public recommendedGames: GameItem[] = [];

  // Home statistics
  public homeStats: HomeStats = {
    totalUsers: 0,
    activeGames: 0,
    todayGames: 0,
    weeklyRanking: null
  };

  // Notifications
  public notifications: AppNotification[] = [];
  public unreadNotificationCount: number = 0;

  // Quick actions
  public quickActions: QuickAction[] = [];

  // UI state
  public selectedGameCategory: string = 'all';
  public isRefreshing: boolean = false;
  public lastRefreshTime: Date | null = null;

  // App state
  public isOnline: boolean = true;
  public appVersion: string = '1.0.0';
  public isMaintenanceMode: boolean = false;

  constructor() {
    super();
    this.initializeQuickActions();
  }

  // User Profile Management

  /**
   * Set user profile data
   */
  setUserProfile(profile: HomeUserProfile | null): void {
    this.userProfile = profile;
    this.isProfileLoaded = true;
    this.touch();
  }

  /**
   * Update user experience
   */
  updateUserExperience(newExperience: number): void {
    if (this.userProfile) {
      this.userProfile.experience = newExperience;
      
      // Check for level up
      const newLevel = this.calculateLevel(newExperience);
      if (newLevel > this.userProfile.level) {
        this.userProfile.level = newLevel;
        this.addLevelUpNotification(newLevel);
      }
      
      this.touch();
    }
  }

  /**
   * Calculate user level from experience
   */
  private calculateLevel(experience: number): number {
    // Simple level calculation: 100 exp per level
    return Math.floor(experience / 100) + 1;
  }

  /**
   * Add level up notification
   */
  private addLevelUpNotification(level: number): void {
    const notification: AppNotification = {
      id: `levelup-${Date.now()}`,
      title: '레벨업!',
      message: `축하합니다! 레벨 ${level}에 도달했습니다!`,
      type: 'success',
      timestamp: new Date(),
      isRead: false
    };
    
    this.addNotification(notification);
  }

  /**
   * Toggle favorite game
   */
  toggleFavoriteGame(gameId: number): void {
    if (!this.userProfile) return;

    const favoriteIndex = this.userProfile.favoriteGames.indexOf(gameId);
    if (favoriteIndex >= 0) {
      this.userProfile.favoriteGames.splice(favoriteIndex, 1);
    } else {
      this.userProfile.favoriteGames.push(gameId);
    }

    // Update game list
    const game = this.gameList.find(g => g.id === gameId);
    if (game) {
      game.isFavorite = favoriteIndex < 0;
    }

    this.touch();
  }

  // Game Management

  /**
   * Set game list
   */
  setGameList(games: GameItem[]): void {
    this.gameList = games.map(game => ({
      ...game,
      isFavorite: this.userProfile?.favoriteGames.includes(game.id) || false
    }));
    
    this.updateGameCategories();
    this.touch();
  }

  /**
   * Update game categories based on game list
   */
  private updateGameCategories(): void {
    // Update featured games (active games with high ratings)
    this.featuredGames = this.gameList
      .filter(game => game.isActive && (game.isNew || game.isFavorite))
      .slice(0, 5);

    // Update recommended games based on user preferences
    this.recommendedGames = this.getRecommendedGames();
  }

  /**
   * Get recommended games based on user profile
   */
  private getRecommendedGames(): GameItem[] {
    if (!this.userProfile) {
      return this.gameList.filter(game => game.isActive).slice(0, 4);
    }

    // Simple recommendation based on favorite games
    const favoriteCategories = this.userProfile.favoriteGames
      .map(gameId => this.gameList.find(g => g.id === gameId)?.category)
      .filter(Boolean);

    return this.gameList
      .filter(game => 
        game.isActive && 
        !this.userProfile!.favoriteGames.includes(game.id) &&
        favoriteCategories.includes(game.category)
      )
      .slice(0, 4);
  }

  /**
   * Get games by category
   */
  getGamesByCategory(category: string = 'all'): GameItem[] {
    if (category === 'all') {
      return this.gameList.filter(game => game.isActive);
    }
    
    if (category === 'favorites') {
      return this.gameList.filter(game => game.isFavorite);
    }
    
    if (category === 'recent') {
      return this.recentlyPlayedGames;
    }

    return this.gameList.filter(game => game.isActive && game.category === category);
  }

  /**
   * Set selected game category
   */
  setSelectedGameCategory(category: string): void {
    this.selectedGameCategory = category;
    this.touch();
  }

  /**
   * Add recently played game
   */
  addRecentlyPlayedGame(gameId: number): void {
    const game = this.gameList.find(g => g.id === gameId);
    if (!game) return;

    // Remove if already exists
    this.recentlyPlayedGames = this.recentlyPlayedGames.filter(g => g.id !== gameId);
    
    // Add to front
    this.recentlyPlayedGames.unshift(game);
    
    // Keep only last 10 games
    this.recentlyPlayedGames = this.recentlyPlayedGames.slice(0, 10);
    
    this.touch();
  }

  // Statistics Management

  /**
   * Set home statistics
   */
  setHomeStats(stats: Partial<HomeStats>): void {
    this.homeStats = { ...this.homeStats, ...stats };
    this.touch();
  }

  /**
   * Update game play count
   */
  updateGamePlayCount(): void {
    if (this.userProfile) {
      this.userProfile.totalGamesPlayed++;
    }
    
    this.homeStats.todayGames++;
    this.touch();
  }

  // Notifications Management

  /**
   * Add notification
   */
  addNotification(notification: AppNotification): void {
    this.notifications.unshift(notification);
    
    if (!notification.isRead) {
      this.unreadNotificationCount++;
    }
    
    // Keep only last 50 notifications
    this.notifications = this.notifications.slice(0, 50);
    
    this.touch();
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.unreadNotificationCount = Math.max(0, this.unreadNotificationCount - 1);
      this.touch();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    
    this.unreadNotificationCount = 0;
    this.touch();
  }

  /**
   * Clear old notifications
   */
  clearOldNotifications(daysOld: number = 7): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    this.notifications = this.notifications.filter(notification => 
      notification.timestamp > cutoffDate
    );
    
    // Recalculate unread count
    this.unreadNotificationCount = this.notifications
      .filter(n => !n.isRead).length;
    
    this.touch();
  }

  // Quick Actions Management

  /**
   * Initialize default quick actions
   */
  private initializeQuickActions(): void {
    this.quickActions = [
      {
        id: 'findit',
        title: '틀린그림찾기',
        icon: 'search',
        route: 'FindIt',
        isEnabled: true
      },
      {
        id: 'slimewar',
        title: '슬라임 워',
        icon: 'gamepad',
        route: 'SlimeWar',
        isEnabled: true
      },
      {
        id: 'sequence',
        title: '시퀀스',
        icon: 'list',
        route: 'Sequence',
        isEnabled: true
      },
      {
        id: 'frog',
        title: '개구리',
        icon: 'frog',
        route: 'Frog',
        isEnabled: true
      }
    ];
  }

  /**
   * Update quick action badge
   */
  updateQuickActionBadge(actionId: string, badge: number | undefined): void {
    const action = this.quickActions.find(a => a.id === actionId);
    if (action) {
      action.badge = badge;
      this.touch();
    }
  }

  /**
   * Toggle quick action enabled state
   */
  toggleQuickAction(actionId: string): void {
    const action = this.quickActions.find(a => a.id === actionId);
    if (action) {
      action.isEnabled = !action.isEnabled;
      this.touch();
    }
  }

  // App State Management

  /**
   * Set online status
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    this.touch();
  }

  /**
   * Set refreshing state
   */
  setRefreshing(isRefreshing: boolean): void {
    this.isRefreshing = isRefreshing;
    if (!isRefreshing) {
      this.lastRefreshTime = new Date();
    }
    this.touch();
  }

  /**
   * Set maintenance mode
   */
  setMaintenanceMode(isMaintenanceMode: boolean): void {
    this.isMaintenanceMode = isMaintenanceMode;
    this.touch();
  }

  /**
   * Set app version
   */
  setAppVersion(version: string): void {
    this.appVersion = version;
    this.touch();
  }

  // Utility Methods

  /**
   * Get available game categories
   */
  getAvailableCategories(): string[] {
    const categories = new Set(this.gameList.map(game => game.category));
    return ['all', 'favorites', 'recent', ...Array.from(categories)];
  }

  /**
   * Search games by name
   */
  searchGames(query: string): GameItem[] {
    if (!query.trim()) {
      return this.getGamesByCategory(this.selectedGameCategory);
    }

    const lowercaseQuery = query.toLowerCase();
    return this.gameList.filter(game =>
      game.isActive &&
      (game.name.toLowerCase().includes(lowercaseQuery) ||
       game.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Reset home data
   */
  resetHomeData(): void {
    this.userProfile = null;
    this.isProfileLoaded = false;
    this.gameList = [];
    this.featuredGames = [];
    this.recentlyPlayedGames = [];
    this.recommendedGames = [];
    this.notifications = [];
    this.unreadNotificationCount = 0;
    this.selectedGameCategory = 'all';
    this.isRefreshing = false;
    this.lastRefreshTime = null;
    this.touch();
  }

  // Domain Model Implementation
  protected serialize(): Record<string, any> {
    return {
      userProfile: this.userProfile ? {
        ...this.userProfile,
        achievements: this.userProfile.achievements.length
      } : null,
      isProfileLoaded: this.isProfileLoaded,
      gamesCount: this.gameList.length,
      featuredGamesCount: this.featuredGames.length,
      recentlyPlayedCount: this.recentlyPlayedGames.length,
      recommendedGamesCount: this.recommendedGames.length,
      homeStats: this.homeStats,
      notificationsCount: this.notifications.length,
      unreadNotificationCount: this.unreadNotificationCount,
      quickActionsCount: this.quickActions.length,
      selectedGameCategory: this.selectedGameCategory,
      isRefreshing: this.isRefreshing,
      lastRefreshTime: this.lastRefreshTime,
      isOnline: this.isOnline,
      appVersion: this.appVersion,
      isMaintenanceMode: this.isMaintenanceMode
    };
  }

  protected validateModel(): ModelValidationError[] {
    const errors: ModelValidationError[] = [];

    if (this.selectedGameCategory && !this.getAvailableCategories().includes(this.selectedGameCategory)) {
      errors.push({
        field: 'selectedGameCategory',
        message: 'Invalid game category selected',
        code: 'INVALID_VALUE',
      });
    }

    if (this.unreadNotificationCount < 0) {
      errors.push({
        field: 'unreadNotificationCount',
        message: 'Unread notification count cannot be negative',
        code: 'INVALID_RANGE',
      });
    }

    if (this.userProfile && this.userProfile.level <= 0) {
      errors.push({
        field: 'userProfile.level',
        message: 'User level must be positive',
        code: 'INVALID_RANGE',
      });
    }

    if (this.notifications.length > 100) {
      errors.push({
        field: 'notifications',
        message: 'Too many notifications stored',
        code: 'INVALID_SIZE',
      });
    }

    return errors;
  }
}

// Business Rules

export class UserCanPlayGameRule implements BusinessRule<HomeModel> {
  constructor(
    private gameId: number
  ) {}

  isSatisfiedBy(model: HomeModel): boolean {
    const game = model.gameList.find(g => g.id === this.gameId);
    if (!game) return false;

    return game.isActive && !model.isMaintenanceMode && model.isOnline;
  }

  getErrorMessage(): string {
    return 'Game is not available or app is in maintenance mode';
  }
}

export class CanAccessFeaturesRule implements BusinessRule<HomeModel> {
  isSatisfiedBy(model: HomeModel): boolean {
    return model.isOnline && !model.isMaintenanceMode;
  }

  getErrorMessage(): string {
    return 'Features are not available in maintenance mode or offline';
  }
}