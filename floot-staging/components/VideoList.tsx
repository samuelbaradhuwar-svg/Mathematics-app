import React from "react";
import { ExternalLink, Search, Clock } from "lucide-react";
import { useVideos, type VideoParams } from "../helpers/useVideoData";
import { Skeleton } from "./Skeleton";
import { Button } from "./Button";
import styles from "./VideoList.module.css";

interface Props extends VideoParams {
  compact?: boolean;
}

// Real YouTube results when a YouTube API key is connected; otherwise honest search links.
export const VideoList: React.FC<Props> = ({ compact, ...params }) => {
  const q = useVideos(params);

  if (q.isLoading) {
    return (
      <div className={styles.list}>
        <Skeleton style={{ height: 110 }} />
        <Skeleton style={{ height: 110 }} />
      </div>
    );
  }
  if (q.isError || !q.data) {
    return <p className={styles.note}>The video list couldn't load right now. Please try again in a little while.</p>;
  }

  const { data } = q;
  return (
    <div className={styles.wrap}>
      {data.videos.length ? (
        <ul className={styles.list}>
          {data.videos.slice(0, compact ? 3 : 6).map((v) => (
            <li key={v.id}>
              <a href={v.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
                <span className={styles.thumbWrap}>
                  <img src={v.thumbnail} alt="" className={styles.thumb} loading="lazy" />
                  <span className={styles.duration}>
                    <Clock size={12} aria-hidden /> {v.duration}
                  </span>
                </span>
                <span className={styles.info}>
                  <strong className={styles.title}>{v.title}</strong>
                  <span className={styles.channel}>{v.channel}</span>
                  <span className={styles.why}>{v.why}</span>
                  <span className={styles.watch}>
                    Watch on YouTube <ExternalLink size={14} aria-hidden />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {data.note ? <p className={styles.note}>{data.note}</p> : null}

      {data.mode === "search-links" || !data.videos.length ? (
        <div className={styles.links}>
          <p className={styles.linkHead}>
            <Search size={16} aria-hidden /> Find lessons on YouTube
          </p>
          {data.searchLinks.map((l) => (
            <Button key={l.url} asChild variant="outline" size="lg" className={styles.linkBtn}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label} <ExternalLink size={16} aria-hidden />
              </a>
            </Button>
          ))}
          <p className={styles.small}>These open a YouTube search. Look for Grade 8 CAPS lessons from South African teachers.</p>
        </div>
      ) : null}
    </div>
  );
};
