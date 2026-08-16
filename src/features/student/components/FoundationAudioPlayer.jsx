import {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../../../lib/supabase'

const FOUNDATION_AUDIO_BUCKET =
  'foundation-audio'

function FoundationAudioPlayer({
  data,
}) {
  const [audioUrl, setAudioUrl] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const storagePath =
    String(
      data?.storagePath || '',
    ).trim()

  useEffect(() => {
    let isMounted = true

    async function loadAudio() {
      if (!storagePath) {
        if (isMounted) {
          setAudioUrl('')
          setError(
            'Audio file is not available.',
          )
          setIsLoading(false)
        }

        return
      }

      setIsLoading(true)
      setError('')

      const {
        data: signedData,
        error: signedError,
      } = await supabase.storage
        .from(
          FOUNDATION_AUDIO_BUCKET,
        )
        .createSignedUrl(
          storagePath,
          60 * 30,
        )

      if (!isMounted) {
        return
      }

      if (signedError) {
        setAudioUrl('')
        setError(
          signedError.message ||
            'Unable to load audio.',
        )
        setIsLoading(false)
        return
      }

      setAudioUrl(
        signedData?.signedUrl || '',
      )

      setIsLoading(false)
    }

    loadAudio()

    return () => {
      isMounted = false
    }
  }, [storagePath])

  return (
    <div className="lesson-content__audio">
      <div className="lesson-content__audio-header">
        <span className="lesson-content__audio-icon">
          ?
        </span>

        <div>
          <strong className="lesson-content__audio-title">
            {data?.title ||
              'Listen'}
          </strong>

          {data?.pronunciationLabel && (
            <div className="lesson-content__audio-pronunciation">
              {
                data.pronunciationLabel
              }
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <p className="lesson-content__audio-status">
          Loading audio...
        </p>
      )}

      {!isLoading &&
        error && (
          <p className="lesson-content__audio-error">
            {error}
          </p>
        )}

      {!isLoading &&
        !error &&
        audioUrl && (
          <audio
            className="lesson-content__audio-player"
            controls
            preload="metadata"
            src={audioUrl}
          >
            Your browser does not
            support audio playback.
          </audio>
        )}

      {data?.transcript && (
        <div className="lesson-content__audio-transcript">
          <span>Transcript</span>
          <p>{data.transcript}</p>
        </div>
      )}

      {data?.example && (
        <div className="lesson-content__audio-example">
          <span>Example</span>
          <p>{data.example}</p>
        </div>
      )}
    </div>
  )
}

export default FoundationAudioPlayer
