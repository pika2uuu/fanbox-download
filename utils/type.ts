export type DownloadItem = {
    targetFilename: string;
    url?: string;
    text?: string;
}

export type DownloadStatusForStart = {
    id: number,
    targetFilename: string,
    state: string,
}

export type DownloadStatusForUpdate = {
    id: number,
    state: string,
}

export type User = {
    userId: string;
    name: string;
    iconUrl: string;
};

export type ProfileItem = {
    id: string;
    type: string;
    imageUrl?: string;
    serviceProvider?: string;
    videoId?: string;
}

export type ImageProfileItem = {
    id: string;
    type: string;
    imageUrl: string;
};

export type VideoProfileItem = {
    id: string;
    type: string;
    serviceProvider: string;
    videoId: string;
}

export type Profile = {
    user: User;
    creatorId: string;
    description: string;
    profileLinks: string[];
    profileItems: (ImageProfileItem | VideoProfileItem)[];
    coverImageUrl: string;
    hasBoothShop: boolean;
};

export type Plan = {
    title: string;
    fee: number;
    description: string;
    coverImageUrl: string;
};

export type PageUrl = {
    url: string;
}

type Image = {
    id: string;
    extension: string;
    originalUrl: string;
};

type ImageMap = {
    id: string;
    extension: string;
    originalUrl: string;
}

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

type EmbedUrl = {
    id: string; // 埋め込みID
    type: string; // 埋め込みタイプ
    html: string; // 埋め込みHTML
};

export type ArticleBody = {
    blocks: Block[];
    imageMap: Record<string, ImageMap>;
    fileMap: Record<string, File>;
    embedMap: Record<string, unknown>;
    urlEmbedMap: Record<string, EmbedUrl>;
}

export type ImageBody = {
    text: string;
    images: Image[];
}

export type TextBody = {
    text: string;
}

export type FileBody = {
    text: string;
    files: File[];
}

export type VideoBody = {
    text: string;
    video: Video;
}

export type Post = {
    body: ArticleBody | ImageBody | FileBody | TextBody | VideoBody | null ; // エラーもしくは課金額が足らないときはbodyがnullになる
    id: string;
    type: string;
    title: string;
    feeRequired: number;
    coverImageUrl?: string;
    imageForShare: string;
    tags: string[];
    isRestricted: boolean;
    publishedDatetime: string;
    creatorId: string;
}