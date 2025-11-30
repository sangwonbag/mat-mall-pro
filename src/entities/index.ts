/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: adminusers
 * Interface for AdminUsers
 */
export interface AdminUsers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  email?: string;
  /** @wixFieldType text */
  passwordHash?: string;
  /** @wixFieldType text */
  displayName?: string;
  /** @wixFieldType text */
  role?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
  /** @wixFieldType datetime */
  lastLoginDate?: Date | string;
}


/**
 * Collection ID: chatconsultations
 * Interface for ChatConsultations
 */
export interface ChatConsultations {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  visitorName?: string;
  /** @wixFieldType text */
  visitorContact?: string;
  /** @wixFieldType text */
  initialInquiry?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  sessionId?: string;
  /** @wixFieldType datetime */
  startTime?: Date | string;
}


/**
 * Collection ID: chatmessages
 * Interface for ChatMessages
 */
export interface ChatMessages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  consultationSessionId?: string;
  /** @wixFieldType text */
  senderType?: string;
  /** @wixFieldType text */
  messageContent?: string;
  /** @wixFieldType datetime */
  sentAt?: Date | string;
  /** @wixFieldType boolean */
  isRead?: boolean;
}


/**
 * Collection ID: constructioncasestudies
 * Interface for ConstructionCaseStudies
 */
export interface ConstructionCaseStudies {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  productName?: string;
  /** @wixFieldType text */
  caseStudyTitle?: string;
  /** @wixFieldType text */
  detailedDescription?: string;
  /** @wixFieldType image */
  descriptionImage?: string;
  /** @wixFieldType image */
  projectExampleImage?: string;
  /** @wixFieldType text */
  productFeatures?: string;
  /** @wixFieldType date */
  completionDate?: Date | string;
}


/**
 * Collection ID: popularsearches
 * Interface for PopularSearches
 */
export interface PopularSearches {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  searchTerm?: string;
  /** @wixFieldType number */
  searchCount?: number;
  /** @wixFieldType date */
  lastSearchedDate?: Date | string;
  /** @wixFieldType text */
  categoryHint?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
}


/**
 * Collection ID: productcategories
 * Interface for ProductCategories
 */
export interface ProductCategories {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  categoryName?: string;
  /** @wixFieldType text */
  categorySlug?: string;
  /** @wixFieldType text */
  categoryDescription?: string;
  /** @wixFieldType image */
  categoryImage?: string;
  /** @wixFieldType number */
  displayOrder?: number;
}


/**
 * Collection ID: products
 * Interface for Products
 */
export interface Products {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType image */
  productImage?: string;
  /** @wixFieldType text */
  productName?: string;
  /** @wixFieldType text */
  specifications?: string;
  /** @wixFieldType number */
  price?: number;
  /** @wixFieldType text */
  brandName?: string;
  /** @wixFieldType text */
  materialCode?: string;
  /** @wixFieldType text */
  category?: string;
}


/**
 * Collection ID: trendycatalogslides
 * Interface for TrendyCatalogSlides
 */
export interface TrendyCatalogSlides {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  pageNumber?: number;
  /** @wixFieldType image */
  slideImage?: string;
  /** @wixFieldType text */
  pageTitle?: string;
  /** @wixFieldType text */
  pageContentSummary?: string;
  /** @wixFieldType url */
  pdfSourceUrl?: string;
}


/**
 * Collection ID: wallpaperpdfsamples
 * Interface for WallpaperPDFSamples
 */
export interface WallpaperPDFSamples {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  sampleName?: string;
  /** @wixFieldType url */
  pdfUrl?: string;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType image */
  thumbnailImage?: string;
}
