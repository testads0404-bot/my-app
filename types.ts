
export enum Tool {
  Post = 'post',
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Hashtag = 'hashtag',
  Icon = 'icon',
  BackgroundRemover = 'background-remover',
  History = 'history',
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  tool: Tool;
  prompt: any;
  result: any;
};

export interface PostSchedule {
  topic: string;
  times: string[]; // e.g., ["09:00", "15:00", "21:00"]
  lastRun: { [time: string]: number }; // e.g., { "09:00": 1678886400000 }
}