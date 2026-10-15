import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Camera, CheckCircle2, ImagePlus, RotateCcw, ScanLine, TriangleAlert } from "lucide-react";
import { resizeImage, type ResizedImage } from "../helpers/resizeImage";
import { useScanExplain, useScanRead } from "../helpers/useScanData";
import type { ScanExplanationDto, ScanReading } from "../helpers/scanTypes";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { MathText } from "../components/MathText";
import { PageHeader } from "../components/PageHeader";
import { ScanExplanation } from "../components/ScanExplanation";
import { Spinner } from "../components/Spinner";
import styles from "./scan.module.css";

type Phase = "capture" | "reading" | "confirm" | "explaining" | "result";

const QUALITY_TEXT: Record<ScanReading["quality"], string> = {
  clear: "",
  okay: "The picture is okay, but please check my reading below.",
  blurry: "The picture looks a bit blurry. Check my reading carefully, or take another photo.",
  dark: "The picture is dark. Check my reading carefully, or take another photo in better light.",
  "cut-off": "Part of the question may be cut off. Check my reading, or take another photo.",
  "no-maths": "I couldn't find a maths question in this picture.",
};

const ScanPage: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("capture");
  const [image, setImage] = useState<ResizedImage | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanId, setScanId] = useState<number | null>(null);
  const [reading, setReading] = useState<ScanReading | null>(null);
  const [picked, setPicked] = useState(0);
  const [text, setText] = useState("");
  const [clarify, setClarify] = useState<Record<number, string>>({});
  const [explanation, setExplanation] = useState<ScanExplanationDto | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const read = useScanRead();
  const explain = useScanExplain();

  const reset = () => {
    setPhase("capture");
    setImage(null);
    setNote("");
    setError(null);
    setScanId(null);
    setReading(null);
    setPicked(0);
    setText("");
    setClarify({});
    setExplanation(null);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setImage(await resizeImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "I couldn't open that picture.");
    }
  };

  const startRead = () => {
    if (!image) return;
    setPhase("reading");
    setError(null);
    read.mutate(
      { imageBase64: image.base64, mediaType: image.mediaType, note: note.trim() || undefined },
      {
        onSuccess: (r) => {
          setScanId(r.scanId);
          setReading(r.reading);
          setPicked(0);
          setText(r.reading.questions[0]?.text ?? "");
          setClarify({});
          setPhase("confirm");
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
          setPhase("capture");
        },
      }
    );
  };

  const pick = (i: number) => {
    setPicked(i);
    setText(reading?.questions[i]?.text ?? "");
    setClarify({});
  };

  const startExplain = () => {
    if (!scanId || !reading) return;
    const q = reading.questions[picked];
    const notes = Object.entries(clarify)
      .map(([k, v]) => `Learner confirmed: where it says "${reading.uncertain[Number(k)]?.whatISaw ?? ""}" it means "${v}".`)
      .join(" ");
    setPhase("explaining");
    setError(null);
    explain.mutate(
      {
        scanId,
        confirmedText: [text.trim(), notes].filter(Boolean).join("\n"),
        diagramNote: q?.hasDiagram ? q.diagramDescription : undefined,
        handwrittenWork: q?.handwrittenWork || undefined,
      },
      {
        onSuccess: (r) => {
          setExplanation(r.explanation);
          setPhase("result");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
          setPhase("confirm");
        },
      }
    );
  };

  const uncertainHere = reading ? reading.uncertain.map((u, idx) => ({ u, idx })).filter((x) => x.u.questionIndex === picked) : [];
  const unresolved = uncertainHere.some((x) => !clarify[x.idx]);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Scan a Question · My Maths Tutor</title>
      </Helmet>
      <PageHeader title="Scan a Question" subtitle="Take a photo of a maths question. I'll read it, check with you, then explain it step by step." icon={<ScanLine size={28} />} />

      {error ? (
        <div className={styles.error} role="alert">
          <TriangleAlert size={20} aria-hidden /> <span>{error}</span>
        </div>
      ) : null}

      {phase === "capture" ? (
        <Card className={styles.capture}>
          {image ? (
            <img src={image.previewUrl} alt="The picture you chose" className={styles.preview} />
          ) : (
            <div className={styles.drop}>
              <Camera size={44} aria-hidden />
              <p>Put the question in the middle of the picture. Good light helps me read it.</p>
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <div className={styles.btns}>
            <Button size="lg" variant={image ? "outline" : "primary"} onClick={() => cameraRef.current?.click()}>
              <Camera size={20} /> {image ? "Take another photo" : "Take a photo"}
            </Button>
            <Button size="lg" variant="outline" onClick={() => galleryRef.current?.click()}>
              <ImagePlus size={20} /> Choose a picture
            </Button>
          </div>
          {image ? (
            <>
              <label className={styles.label}>
                Anything I should know? (optional)
                <input className={styles.noteInput} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. it's question 3, or I don't get part (b)" />
              </label>
              <Button size="lg" className={styles.go} onClick={startRead}>
                <ScanLine size={20} /> Read my question
              </Button>
            </>
          ) : null}
          <p className={styles.privacy}>Your picture is sent to the AI tutor only to read the question. It isn't shared with anyone else.</p>
        </Card>
      ) : null}

      {phase === "reading" ? (
        <Card className={styles.busy}>
          <Spinner size="lg" />
          <h2 className={styles.h2}>Reading your picture…</h2>
          <p className={styles.muted}>I'm copying the question out carefully. This takes a few seconds.</p>
        </Card>
      ) : null}

      {phase === "confirm" && reading ? (
        <div className={styles.stack}>
          {reading.quality !== "clear" && QUALITY_TEXT[reading.quality] ? (
            <div className={styles.warn}>
              <TriangleAlert size={20} aria-hidden /> <span>{reading.qualityNote || QUALITY_TEXT[reading.quality]}</span>
            </div>
          ) : null}

          {reading.questions.length === 0 ? (
            <Card className={styles.stack}>
              <h2 className={styles.h2}>I couldn't find a question</h2>
              <p>{reading.summary || "Try a closer, clearer photo with the whole question showing."}</p>
              <Button size="lg" onClick={reset}>
                <RotateCcw size={18} /> Try another photo
              </Button>
            </Card>
          ) : (
            <>
              {reading.questions.length > 1 ? (
                <Card className={styles.stack}>
                  <h2 className={styles.h2}>I found {reading.questions.length} questions. Which one do you need help with?</h2>
                  <div className={styles.qList}>
                    {reading.questions.map((q, i) => (
                      <button key={i} type="button" className={`${styles.qBtn} ${picked === i ? styles.qOn : ""}`} onClick={() => pick(i)}>
                        <strong>{q.number || i + 1}.</strong> <MathText text={q.text} inline />
                      </button>
                    ))}
                  </div>
                </Card>
              ) : null}

              <Card className={styles.stack}>
                <h2 className={styles.h2}>Is this what your question says?</h2>
                <p className={styles.muted}>Please check every number and sign. If something is wrong, fix it in the box.</p>
                <div className={styles.seen}>
                  <MathText text={text} />
                </div>
                <textarea className={styles.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label="Question text" />
                {reading.questions[picked]?.hasDiagram ? (
                  <p className={styles.muted}>
                    <strong>Diagram I could see:</strong> {reading.questions[picked].diagramDescription}
                  </p>
                ) : null}
                {reading.questions[picked]?.handwrittenWork ? (
                  <p className={styles.muted}>
                    <strong>Your working I could see:</strong> {reading.questions[picked].handwrittenWork}
                  </p>
                ) : null}
              </Card>

              {uncertainHere.map(({ u, idx }) => (
                <Card key={idx} tone="warm" className={styles.stack}>
                  <h2 className={styles.h2}>I'm not sure about this part</h2>
                  <p>
                    I saw: <strong>{u.whatISaw}</strong>. {u.why}
                  </p>
                  <p className={styles.muted}>Tap what it really says:</p>
                  <div className={styles.opts}>
                    {u.options.map((o) => (
                      <button key={o} type="button" className={`${styles.opt} ${clarify[idx] === o ? styles.qOn : ""}`} onClick={() => setClarify((c) => ({ ...c, [idx]: o }))}>
                        <MathText text={o} inline />
                      </button>
                    ))}
                    <button type="button" className={`${styles.opt} ${clarify[idx] === "something else (I fixed it in the box)" ? styles.qOn : ""}`} onClick={() => setClarify((c) => ({ ...c, [idx]: "something else (I fixed it in the box)" }))}>
                      Something else
                    </button>
                  </div>
                </Card>
              ))}

              <div className={styles.btns}>
                <Button size="lg" className={styles.go} disabled={unresolved || text.trim().length < 2} onClick={startExplain}>
                  <CheckCircle2 size={20} /> Yes, explain it to me
                </Button>
                <Button size="lg" variant="ghost" onClick={reset}>
                  <RotateCcw size={18} /> Start again
                </Button>
              </div>
              {unresolved ? <p className={styles.muted}>Please tell me about the part I wasn't sure of first. I never guess unclear symbols.</p> : null}
            </>
          )}
        </div>
      ) : null}

      {phase === "explaining" ? (
        <Card className={styles.busy}>
          <Spinner size="lg" />
          <h2 className={styles.h2}>Working it out carefully…</h2>
          <p className={styles.muted}>I'm solving it and checking my answer before I show you. This can take up to half a minute.</p>
        </Card>
      ) : null}

      {phase === "result" && explanation ? <ScanExplanation explanation={explanation} onAnother={reset} /> : null}
    </div>
  );
};

export default ScanPage;
