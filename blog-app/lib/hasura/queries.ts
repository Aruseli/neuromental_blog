import { gql } from '@apollo/client';

// Фрагменты для повторного использования
export const POST_FRAGMENT = gql`
  fragment PostFragment on posts {
    id
    title
    slug
    excerpt
    cover_image
    status
    layout_json
    created_at
    updated_at
    published_at
    scheduled_at
    author {
      id
      name
      image
    }
  }
`;

export const POST_BLOCK_FRAGMENT = gql`
  fragment PostBlockFragment on post_blocks {
    id
    type
    content
    grid_id
    created_at
    updated_at
  }
`;

export const SOCIAL_ACCOUNT_FRAGMENT = gql`
  fragment SocialAccountFragment on social_accounts {
    id
    platform
    platform_user_id
    platform_username
    created_at
    updated_at
  }
`;

export const SOCIAL_PUBLICATION_FRAGMENT = gql`
  fragment SocialPublicationFragment on social_publications {
    id
    platform
    status
    external_url
    external_id
    published_at
    scheduled_at
    error_message
    created_at
  }
`;

// Запросы для постов
export const GET_POSTS = gql`
  query GetPosts($limit: Int, $offset: Int, $status: String) {
    posts(
      limit: $limit
      offset: $offset
      where: { status: { _eq: $status } }
      order_by: { created_at: desc }
    ) {
      ...PostFragment
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    posts(where: { slug: { _eq: $slug } }) {
      ...PostFragment
      blocks {
        ...PostBlockFragment
      }
    }
  }
  ${POST_FRAGMENT}
  ${POST_BLOCK_FRAGMENT}
`;

export const GET_POST_BY_ID = gql`
  query GetPostById($id: uuid!) {
    posts_by_pk(id: $id) {
      ...PostFragment
      blocks {
        ...PostBlockFragment
      }
    }
  }
  ${POST_FRAGMENT}
  ${POST_BLOCK_FRAGMENT}
`;

export const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!
    $slug: String!
    $excerpt: String
    $cover_image: String
    $status: String!
    $layout_json: jsonb
    $scheduled_at: timestamptz
  ) {
    insert_posts_one(
      object: {
        title: $title
        slug: $slug
        excerpt: $excerpt
        cover_image: $cover_image
        status: $status
        layout_json: $layout_json
        scheduled_at: $scheduled_at
      }
    ) {
      id
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost(
    $id: uuid!
    $title: String
    $slug: String
    $excerpt: String
    $cover_image: String
    $status: String
    $layout_json: jsonb
    $scheduled_at: timestamptz
    $published_at: timestamptz
  ) {
    update_posts_by_pk(
      pk_columns: { id: $id }
      _set: {
        title: $title
        slug: $slug
        excerpt: $excerpt
        cover_image: $cover_image
        status: $status
        layout_json: $layout_json
        scheduled_at: $scheduled_at
        published_at: $published_at
      }
    ) {
      id
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: uuid!) {
    delete_posts_by_pk(id: $id) {
      id
    }
  }
`;

// Запросы для блоков контента
export const CREATE_POST_BLOCK = gql`
  mutation CreatePostBlock(
    $post_id: uuid!
    $type: String!
    $content: jsonb!
    $grid_id: String!
  ) {
    insert_post_blocks_one(
      object: {
        post_id: $post_id
        type: $type
        content: $content
        grid_id: $grid_id
      }
    ) {
      id
    }
  }
`;

export const UPDATE_POST_BLOCK = gql`
  mutation UpdatePostBlock(
    $id: uuid!
    $type: String
    $content: jsonb
    $grid_id: String
  ) {
    update_post_blocks_by_pk(
      pk_columns: { id: $id }
      _set: { type: $type, content: $content, grid_id: $grid_id }
    ) {
      id
    }
  }
`;

export const DELETE_POST_BLOCK = gql`
  mutation DeletePostBlock($id: uuid!) {
    delete_post_blocks_by_pk(id: $id) {
      id
    }
  }
`;

// Запросы для социальных аккаунтов
export const GET_SOCIAL_ACCOUNTS = gql`
  query GetSocialAccounts {
    social_accounts {
      ...SocialAccountFragment
    }
  }
  ${SOCIAL_ACCOUNT_FRAGMENT}
`;

export const GET_SOCIAL_ACCOUNT_BY_PLATFORM = gql`
  query GetSocialAccountByPlatform($platform: String!) {
    social_accounts(where: { platform: { _eq: $platform } }) {
      ...SocialAccountFragment
    }
  }
  ${SOCIAL_ACCOUNT_FRAGMENT}
`;

export const CREATE_SOCIAL_ACCOUNT = gql`
  mutation CreateSocialAccount(
    $platform: String!
    $access_token: String!
    $refresh_token: String
    $token_expires_at: timestamptz
    $platform_user_id: String!
    $platform_username: String
  ) {
    insert_social_accounts_one(
      object: {
        platform: $platform
        access_token: $access_token
        refresh_token: $refresh_token
        token_expires_at: $token_expires_at
        platform_user_id: $platform_user_id
        platform_username: $platform_username
      }
    ) {
      id
    }
  }
`;

export const UPDATE_SOCIAL_ACCOUNT = gql`
  mutation UpdateSocialAccount(
    $id: uuid!
    $access_token: String
    $refresh_token: String
    $token_expires_at: timestamptz
    $platform_username: String
  ) {
    update_social_accounts_by_pk(
      pk_columns: { id: $id }
      _set: {
        access_token: $access_token
        refresh_token: $refresh_token
        token_expires_at: $token_expires_at
        platform_username: $platform_username
      }
    ) {
      id
    }
  }
`;

export const DELETE_SOCIAL_ACCOUNT = gql`
  mutation DeleteSocialAccount($id: uuid!) {
    delete_social_accounts_by_pk(id: $id) {
      id
    }
  }
`;

// Запросы для публикаций в соцсетях
export const GET_SOCIAL_PUBLICATIONS = gql`
  query GetSocialPublications($post_id: uuid) {
    social_publications(
      where: { post_id: { _eq: $post_id } }
      order_by: { created_at: desc }
    ) {
      ...SocialPublicationFragment
      social_account {
        ...SocialAccountFragment
      }
      stats {
        id
        views
        likes
        comments
        shares
        collected_at
      }
    }
  }
  ${SOCIAL_PUBLICATION_FRAGMENT}
  ${SOCIAL_ACCOUNT_FRAGMENT}
`;

export const CREATE_SOCIAL_PUBLICATION = gql`
  mutation CreateSocialPublication(
    $post_id: uuid!
    $social_account_id: uuid!
    $platform: String!
    $status: String!
    $external_url: String
    $external_id: String
    $published_at: timestamptz
    $scheduled_at: timestamptz
    $error_message: String
  ) {
    insert_social_publications_one(
      object: {
        post_id: $post_id
        social_account_id: $social_account_id
        platform: $platform
        status: $status
        external_url: $external_url
        external_id: $external_id
        published_at: $published_at
        scheduled_at: $scheduled_at
        error_message: $error_message
      }
    ) {
      id
    }
  }
`;

export const UPDATE_SOCIAL_PUBLICATION = gql`
  mutation UpdateSocialPublication(
    $id: uuid!
    $status: String
    $external_url: String
    $external_id: String
    $published_at: timestamptz
    $scheduled_at: timestamptz
    $error_message: String
  ) {
    update_social_publications_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: $status
        external_url: $external_url
        external_id: $external_id
        published_at: $published_at
        scheduled_at: $scheduled_at
        error_message: $error_message
      }
    ) {
      id
    }
  }
`;

// Запросы для статистики
export const CREATE_SOCIAL_STATS = gql`
  mutation CreateSocialStats(
    $publication_id: uuid!
    $views: Int!
    $likes: Int!
    $comments: Int!
    $shares: Int!
  ) {
    insert_social_stats_one(
      object: {
        publication_id: $publication_id
        views: $views
        likes: $likes
        comments: $comments
        shares: $shares
      }
    ) {
      id
    }
  }
`;

// Запросы для подписчиков
export const CREATE_SUBSCRIBER = gql`
  mutation CreateSubscriber($email: String!, $name: String) {
    insert_subscribers_one(
      object: { email: $email, name: $name }
    ) {
      id
    }
  }
`;

export const UNSUBSCRIBE = gql`
  mutation Unsubscribe($email: String!) {
    update_subscribers(
      where: { email: { _eq: $email } }
      _set: { status: "unsubscribed" }
    ) {
      affected_rows
    }
  }
`;
