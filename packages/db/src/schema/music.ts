import { pgTable, uuid, text, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';

export const audioTrackEvents = pgTable(
  'audio_track_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull().default('spotify'),
    trackName: text('track_name').notNull(),
    artistName: text('artist_name').notNull(),
    albumName: text('album_name'),
    trackExternalId: text('track_external_id'),
    durationMs: integer('duration_ms'),
    contextType: text('context_type'), // playlist, album, artist
    audioFeatures: jsonb('audio_features').$type<{
      bpm?: number;
      energy?: number;
      valence?: number;
      danceability?: number;
    }>(),
    playedAt: timestamp('played_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audio_tracks_played_at').on(table.playedAt),
    index('idx_audio_tracks_external').on(table.trackExternalId),
  ],
);
