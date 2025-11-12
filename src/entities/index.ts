/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

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
