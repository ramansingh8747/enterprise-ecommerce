// Barrel export for Wishlist module (Interfaces, Models, Repositories, Services, Controllers, Validations, Routes)
export * from './interfaces/wishlist-item.interface';
export * from './interfaces/wishlist.interface';
export * from './interfaces/wishlist-repository.interface';
export * from './interfaces/wishlist-service.interface';
export * from './dto/add-to-wishlist.dto';
export * from './dto/remove-wishlist-item.dto';
export * from './dto/wishlist-response.dto';
export * from './models/wishlist.model';
export * from './repositories/wishlist.repository';
export * from './services/wishlist.service';
export * from './controllers/wishlist.controller';
export * from './validations/wishlist.validation';
export { default as wishlistRoutes } from './routes/wishlist.routes';
