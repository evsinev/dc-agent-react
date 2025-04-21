function detectColor(line: string) {
  if (line.startsWith('-')) {
    return '#DB7064';
  }
  if (line.startsWith('+')) {
    return '#5CB557';
  }
  return '';
}

export default function CodeHighlight({ code }: { code?: string | null }) {
  const lines = code?.split(/\r\n|\r|\n/).map((line) => line.trim());

  return (
    <pre>
      {lines?.map((line, index) => (
        <span
          key={index}
          style={{ color: detectColor(line) }}
        >
          {line}
          <br />
        </span>
      ))}
    </pre>
  );
}
