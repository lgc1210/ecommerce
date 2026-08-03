import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsBreadcrumb extends Struct.ComponentSchema {
  collectionName: 'components_sections_breadcrumbs';
  info: {
    displayName: 'Breadcrumb';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCtaSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_sections';
  info: {
    displayName: 'cta_section';
  };
  attributes: {
    btn_text: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsStatsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_stats_sections';
  info: {
    displayName: 'StatsSection';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface SectionsStorySection extends Struct.ComponentSchema {
  collectionName: 'components_sections_story_sections';
  info: {
    displayName: 'StorySection';
  };
  attributes: {
    badge: Schema.Attribute.String;
    banner: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    btn_second_text: Schema.Attribute.String;
    btn_text: Schema.Attribute.String;
    content: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface SectionsValueItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_value_items';
  info: {
    displayName: 'ValueItem';
  };
  attributes: {
    description: Schema.Attribute.String;
    icon_name: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsValueSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_value_sections';
  info: {
    displayName: 'ValueSection';
  };
  attributes: {
    description: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'sections.value-item', true>;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'sections.breadcrumb': SectionsBreadcrumb;
      'sections.cta-section': SectionsCtaSection;
      'sections.stats-section': SectionsStatsSection;
      'sections.story-section': SectionsStorySection;
      'sections.value-item': SectionsValueItem;
      'sections.value-section': SectionsValueSection;
    }
  }
}
