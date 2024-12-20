export type User = {
  userId: string;
  name: string;
  iconUrl: string;
};

export type ProfileItem = {
  id: string;
  type: "image";
  imageUrl: string;
  thumbnailUrl: string;
};

export type CreatorData = {
  user: User;
  creatorId: string;
  description: string;
  profileLinks: string[];
  profileItems: ProfileItem[];
  coverImageUrl: string;
};

export type Plan = {
  title: string;
  fee: number;
  description: string;
  coverImageUrl: string;
  user: User;
};

export type PageUrl = {
  url: string;
}

type Image = {
  id: string;
  originalUrl: string;
};

export type Block =
  | { type: "p"; text: string }
  | { type: "image"; imageId: string }
  | { type: "url_embed"; urlEmbedId: string }
  | { type: "file"; fileId: string };

type File = {
  name: string;
  extension: string;
  size: number;
  url: string;
};

type Video = {
  serviceProvider: string;
  videoId: string;
}


type UrlEmbed = {
  id: string; // 埋め込みID
  type: string; // 埋め込みタイプ
  html: string; // 埋め込みHTML
};

export type ArticleBody = {
  blocks: Block[];
  imageMap: Record<string, Image>;
  fileMap: Record<string, File>;
  embedMap: Record<string, unknown>;
  urlEmbedMap: Record<string, UrlEmbed>;
}

type ImageBody = {
  text: string;
  images: Image[];
}

type TextBody = {
  text: string;
}

type FileBody = {
  text: string;
  files: File[];
}

type VideoBody = {
  text: string;
  video: Video[];
}

type Body = {
  text: string;
  blocks: Block[];
  imageMap: Record<string, Image>;
  files?: File[];
  fileMap: Record<string, File>;
  embedMap: Record<string, unknown>;
  urlEmbedMap: Record<string, UrlEmbed>;
};

type BasePost = {
  id: string;
  title: string;
  publishedDatetime: string;
  tags: string[];
  isRestricted: boolean;
  type: string;
  coverImageUrl: string | null;
  excerpt: string;
  imageForShare: string;
}

export type ImagePost = BasePost & {
  body: ImageBody;
}

export type ArticlePost = BasePost & {
  body: ArticleBody;
}

export type FilePost = BasePost & {
  body: FileBody;
}

export type VideoPost = BasePost & {
  body: VideoBody;
}

export type TextPost = BasePost & {
  body: TextBody;
}

export interface Post {
  id: string;
  title: string;
  publishedDatetime: string;
  tags: string[];
  isRestricted: boolean;
  type: string;
  coverImageUrl: string | null;
  body: Body | null;
  excerpt: string;
  imageForShare: string;
}
