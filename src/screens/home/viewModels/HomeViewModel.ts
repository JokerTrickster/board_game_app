import { action, computed, observable } from 'mobx';
import { BaseViewModel } from '../../../infrastructure/mvvm/BaseViewModel';
import { 
  HomeModel, 
  GameItem, 
  HomeUserProfile, 
  HomeStats, 
  AppNotification,
  QuickAction,
  UserCanPlayGameRule,
  CanAccessFeaturesRule
} from '../models/HomeModel';
import { LoginService } from '../../../services/LoginService';
import { gameService } from '../../../services/GameService';
import { AuthService } from '../../../services/AuthService';

export class HomeViewModel extends BaseViewModel {
  @observable private homeModel: HomeModel;
  @observable public searchQuery: string = '';

  // Refresh control
  private refreshTimestamp: number = 0;
  private readonly REFRESH_COOLDOWN = 30000; // 30 seconds

  constructor() {
    super();
    this.homeModel = new HomeModel();
  }

  // Computed properties for UI binding
  @computed get userProfile(): HomeUserProfile | null {
    return this.homeModel.userProfile;
  }

  @computed get isProfileLoaded(): boolean {
    return this.homeModel.isProfileLoaded;
  }

  @computed get gameList(): GameItem[] {
    if (this.searchQuery.trim()) {
      return this.homeModel.searchGames(this.searchQuery);
    }
    return this.homeModel.getGamesByCategory(this.homeModel.selectedGameCategory);
  }

  @computed get featuredGames(): GameItem[] {
    return this.homeModel.featuredGames;
  }

  @computed get recentlyPlayedGames(): GameItem[] {
    return this.homeModel.recentlyPlayedGames;
  }

  @computed get recommendedGames(): GameItem[] {
    return this.homeModel.recommendedGames;
  }

  @computed get homeStats(): HomeStats {
    return this.homeModel.homeStats;
  }

  @computed get notifications(): AppNotification[] {
    return this.homeModel.notifications.slice(0, 10); // Show only recent 10
  }

  @computed get unreadNotificationCount(): number {
    return this.homeModel.unreadNotificationCount;
  }

  @computed get quickActions(): QuickAction[] {
    return this.homeModel.quickActions.filter(action => action.isEnabled);
  }

  @computed get selectedGameCategory(): string {
    return this.homeModel.selectedGameCategory;
  }

  @computed get availableCategories(): string[] {
    return this.homeModel.getAvailableCategories();
  }

  @computed get isRefreshing(): boolean {
    return this.homeModel.isRefreshing;
  }

  @computed get lastRefreshTime(): Date | null {
    return this.homeModel.lastRefreshTime;
  }

  @computed get isOnline(): boolean {
    return this.homeModel.isOnline;
  }

  @computed get isMaintenanceMode(): boolean {
    return this.homeModel.isMaintenanceMode;
  }

  @computed get canRefresh(): boolean {
    return Date.now() - this.refreshTimestamp > this.REFRESH_COOLDOWN;
  }

  @computed get userName(): string {
    return this.homeModel.userProfile?.name || 'Guest';
  }

  @computed get userLevel(): number {
    return this.homeModel.userProfile?.level || 1;
  }

  @computed get userExperience(): number {
    return this.homeModel.userProfile?.experience || 0;
  }

  // User Profile Management

  /**
   * Load user profile data
   */
  @action
  public async loadUserProfile(): Promise<boolean> {
    return this.executeAsync(async () => {
      const userID = await AuthService.getUserID();
      if (!userID) {
        this.homeModel.setUserProfile(null);
        return false;
      }

      const response = await LoginService.fetchUserData(userID);
      if (response.success && response.user) {
        // Save to game service for other components
        await gameService.setUserInfo(response);

        // Convert to HomeUserProfile format
        const homeProfile: HomeUserProfile = {
          userID,
          name: response.user.name || 'Player',
          email: response.user.email || '',
          profileImage: response.profileImage || null,
          level: response.user.level || 1,
          experience: response.user.experience || 0,
          totalGamesPlayed: response.user.totalGamesPlayed || 0,
          favoriteGames: response.user.favoriteGames || [],
          achievements: response.user.achievements || []
        };

        this.homeModel.setUserProfile(homeProfile);
        return true;
      }

      return false;
    }) !== null;
  }

  /**
   * Update user experience
   */
  @action
  public updateExperience(experienceGained: number): void {
    if (this.homeModel.userProfile) {
      const newExperience = this.homeModel.userProfile.experience + experienceGained;
      this.homeModel.updateUserExperience(newExperience);
    }
  }

  /**
   * Toggle favorite game
   */
  @action
  public async toggleFavoriteGame(gameId: number): Promise<boolean> {
    const rule = new CanAccessFeaturesRule();
    if (!rule.isSatisfiedBy(this.homeModel)) {
      this.setError(rule.getErrorMessage());
      return false;
    }

    return this.executeAsync(async () => {
      this.homeModel.toggleFavoriteGame(gameId);
      
      // Sync with server if needed
      // await this.syncFavoritesToServer();
      
      return true;
    }) !== null;
  }

  // Game Management

  /**
   * Load game list
   */
  @action
  public async loadGameList(): Promise<boolean> {
    return this.executeAsync(async () => {
      const games = await gameService.fetchGameList();
      
      // Convert to GameItem format
      const gameItems: GameItem[] = games.map(game => ({
        id: game.id || 0,
        name: game.name || 'Unknown Game',
        description: game.description || '',
        image: game.image || '',
        category: game.category || 'other',
        playerCount: {
          min: game.minPlayers || 1,
          max: game.maxPlayers || 4
        },
        playTime: game.playTime || 30,
        difficulty: game.difficulty || 'medium',
        isActive: game.isActive !== false,
        isNew: game.isNew || false,
        isFavorite: false // Will be set based on user profile
      }));

      this.homeModel.setGameList(gameItems);
      return true;
    }) !== null;
  }

  /**
   * Select game category
   */
  @action
  public setGameCategory(category: string): void {
    this.homeModel.setSelectedGameCategory(category);
  }

  /**
   * Search games
   */
  @action
  public setSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  /**
   * Clear search
   */
  @action
  public clearSearch(): void {
    this.searchQuery = '';
  }

  /**
   * Play game
   */
  @action
  public async playGame(gameId: number): Promise<{ canPlay: boolean; route?: string; params?: any }> {
    const rule = new UserCanPlayGameRule(gameId);
    if (!rule.isSatisfiedBy(this.homeModel)) {
      this.setError(rule.getErrorMessage());
      return { canPlay: false };
    }

    const game = this.homeModel.gameList.find(g => g.id === gameId);
    if (!game) {
      this.setError('Game not found');
      return { canPlay: false };
    }

    // Add to recently played
    this.homeModel.addRecentlyPlayedGame(gameId);

    // Update game play stats
    this.homeModel.updateGamePlayCount();

    // Return navigation info based on game name
    const routeMapping: Record<string, string> = {
      'FindIt': 'FindIt',
      'SlimeWar': 'SlimeWar',
      'Sequence': 'Sequence',
      'Frog': 'Frog'
    };

    const route = routeMapping[game.name] || 'GameDetail';
    const params = route === 'GameDetail' ? { game: game.name } : undefined;

    return { 
      canPlay: true, 
      route, 
      params 
    };
  }

  // Statistics Management

  /**
   * Load home statistics
   */
  @action
  public async loadHomeStats(): Promise<boolean> {
    return this.executeAsync(async () => {
      // This would typically fetch from an analytics API
      // For now, using mock data
      const stats: Partial<HomeStats> = {
        totalUsers: Math.floor(Math.random() * 10000) + 1000,
        activeGames: this.homeModel.gameList.filter(g => g.isActive).length,
        todayGames: Math.floor(Math.random() * 100),
        weeklyRanking: Math.floor(Math.random() * 1000) + 1
      };

      this.homeModel.setHomeStats(stats);
      return true;
    }) !== null;
  }

  // Notifications Management

  /**
   * Load notifications
   */
  @action
  public async loadNotifications(): Promise<boolean> {
    return this.executeAsync(async () => {
      // This would typically fetch from a notifications API
      // For now, creating welcome notification if no notifications exist
      if (this.homeModel.notifications.length === 0) {
        this.addWelcomeNotification();
      }

      return true;
    }) !== null;
  }

  /**
   * Add welcome notification for new users
   */
  @action
  private addWelcomeNotification(): void {
    const welcomeNotification: AppNotification = {
      id: `welcome-${Date.now()}`,
      title: '환영합니다!',
      message: '보드게임 앱에 오신 것을 환영합니다. 다양한 게임을 즐겨보세요!',
      type: 'info',
      timestamp: new Date(),
      isRead: false
    };

    this.homeModel.addNotification(welcomeNotification);
  }

  /**
   * Mark notification as read
   */
  @action
  public markNotificationAsRead(notificationId: string): void {
    this.homeModel.markNotificationAsRead(notificationId);
  }

  /**
   * Mark all notifications as read
   */
  @action
  public markAllNotificationsAsRead(): void {
    this.homeModel.markAllNotificationsAsRead();
  }

  /**
   * Clear old notifications
   */
  @action
  public clearOldNotifications(): void {
    this.homeModel.clearOldNotifications(7); // Clear notifications older than 7 days
  }

  // Quick Actions Management

  /**
   * Execute quick action
   */
  @action
  public async executeQuickAction(actionId: string): Promise<{ route: string; params?: any } | null> {
    const rule = new CanAccessFeaturesRule();
    if (!rule.isSatisfiedBy(this.homeModel)) {
      this.setError(rule.getErrorMessage());
      return null;
    }

    const action = this.homeModel.quickActions.find(a => a.id === actionId);
    if (!action) {
      this.setError('Quick action not found');
      return null;
    }

    // Clear badge when action is used
    this.homeModel.updateQuickActionBadge(actionId, undefined);

    return {
      route: action.route,
      params: action.params
    };
  }

  // Data Refresh

  /**
   * Refresh all home data
   */
  @action
  public async refreshHomeData(): Promise<boolean> {
    if (!this.canRefresh) {
      this.setError('Please wait before refreshing again');
      return false;
    }

    this.refreshTimestamp = Date.now();

    return this.executeAsync(async () => {
      this.homeModel.setRefreshing(true);

      try {
        // Load all data in parallel
        const [profileLoaded, gamesLoaded, statsLoaded, notificationsLoaded] = await Promise.all([
          this.loadUserProfile(),
          this.loadGameList(),
          this.loadHomeStats(),
          this.loadNotifications()
        ]);

        // At least user profile and games should load successfully
        const success = profileLoaded && gamesLoaded;
        
        if (success) {
          this.clearOldNotifications();
        }

        return success;
      } finally {
        this.homeModel.setRefreshing(false);
      }
    }) !== null;
  }

  /**
   * Soft refresh (only update dynamic data)
   */
  @action
  public async softRefresh(): Promise<boolean> {
    return this.executeAsync(async () => {
      const [statsLoaded, notificationsLoaded] = await Promise.all([
        this.loadHomeStats(),
        this.loadNotifications()
      ]);

      return statsLoaded || notificationsLoaded;
    }) !== null;
  }

  // App State Management

  /**
   * Set online status
   */
  @action
  public setOnlineStatus(isOnline: boolean): void {
    this.homeModel.setOnlineStatus(isOnline);
    
    if (isOnline) {
      // Auto refresh when coming back online
      this.softRefresh();
    }
  }

  /**
   * Handle app foreground
   */
  @action
  public async handleAppForeground(): Promise<void> {
    // Refresh data when app comes to foreground
    if (this.canRefresh) {
      await this.softRefresh();
    }
  }

  /**
   * Handle app background
   */
  @action
  public handleAppBackground(): void {
    // Clear search when app goes to background
    this.clearSearch();
  }

  // Analytics and Tracking

  /**
   * Track game selection
   */
  @action
  public trackGameSelection(gameId: number, source: string): void {
    // This would integrate with analytics services
    console.log(`Game selected: ${gameId} from ${source}`);
  }

  /**
   * Track category change
   */
  @action
  public trackCategoryChange(category: string): void {
    console.log(`Category changed to: ${category}`);
  }

  /**
   * Get user engagement metrics
   */
  @action
  public getUserEngagementMetrics(): any {
    return {
      totalGamesPlayed: this.homeModel.userProfile?.totalGamesPlayed || 0,
      favoriteGamesCount: this.homeModel.userProfile?.favoriteGames.length || 0,
      unreadNotifications: this.homeModel.unreadNotificationCount,
      lastRefresh: this.homeModel.lastRefreshTime,
      currentLevel: this.homeModel.userProfile?.level || 1
    };
  }

  // Event handlers for external subscriptions

  /**
   * Subscribe to profile changes
   */
  public onProfileChange(callback: (profile: HomeUserProfile | null) => void): () => void {
    // This would typically use MobX reactions
    return () => {};
  }

  /**
   * Subscribe to notification changes
   */
  public onNotificationChange(callback: (count: number) => void): () => void {
    // This would typically use MobX reactions
    return () => {};
  }

  // Initialization and Cleanup

  /**
   * Initialize home screen
   */
  public async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.refreshHomeData();
      this.setInitialized(true);
    }
  }

  /**
   * Cleanup home resources
   */
  public cleanup(): void {
    this.homeModel.resetHomeData();
    this.searchQuery = '';
    super.cleanup();
  }
}