import { ChevronRightIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Head from 'next/head';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import useSWRMutation from 'swr/mutation';

const jd = {
  name: 'John Dorian',
  details: 'the main character from Scrubs',
  description: `John Dorian, known as J.D., is the main character in the comedy series Scrubs. He is an idealistic and sensitive young doctor who always looks to do what’s right for his patients, no matter how difficult it may be. Though he often makes mistakes and gets himself into trouble, he never gives up on finding a solution or helping those around him.

J.D. is portrayed as a highly intelligent yet naive individual with an optimistic outlook on life despite all of its hardships and disappointments; he has a strong belief that everything will work out in the end if you just try hard enough – something which at times causes more harm than good! Despite this optimism, J.D.'s journey through medical school is filled with moments of doubt and insecurity due to his inexperience compared to his peers—especially Dr Cox—which leads him to relying heavily on advice from friends such as Turk and Elliot (his love interest).

He's quite laid-back when it comes to relationships; although not particularly experienced in romance either, he does make considerable efforts for those close to him - especially Elliot whom he loves deeply but struggles with reciprocating her feelings due mainly to their conflicting personalities (Elliot being much more rational). His best friend Turk provides comedic relief throughout the show while also providing support whenever needed - they are almost inseparable!

Physically speaking, J.D.'s tall stature combined with his trademark blue scrubs give off an aura of authority despite his youthful appearance - something which allows him stand out amongst other doctors at Sacred Heart Hospital (the show's setting). As well as being responsible for some hilarious antics during his time there, John Dorian plays a vital role in many important storylines throughout Scrubs' nine seasons; making sure every patient receives care regardless of their background or beliefs whilst overcoming personal issues along the way too!`,
};

type Person = {
  name: string;
  details: string;
  description: string;
};

export default function Home() {
  const [person, setPerson] = useState<Person>();
  const [conversation, setConversation] = useState<string[]>([]);

  const addLine = useCallback((line: string) => {
    setConversation((conversation) => [...(conversation ?? []), line]);
  }, []);

  const [generateDescription, generatingDescription] = useGenerate({
    onError: console.error,
    onSuccess: useCallback(
      (description) => setPerson((person) => ({ ...(person as Person), description })),
      []
    ),
  });

  const [generateAnswer, generatingAnswer] = useGenerate({
    onError: console.error,
    onSuccess: addLine,
  });

  return (
    <>
      <Head>
        <title>Talk with anyone</title>
      </Head>

      <main className="container mx-auto col gap-4 max-w-[1200px] p-4">
        <h1 className="my-6">Talk with {person?.name || 'anyone'}!</h1>

        <PersonForm
          disabled={generatingDescription || Boolean(person)}
          onSubmit={(person) => {
            setPerson(person);
            generateDescription(descriptionPrompt(person));
          }}
        />

        {person && (
          <>
            <Prompt prompt={descriptionPrompt(person)} outcome={person.description} />

            <Conversation
              person={person}
              disabled={generatingAnswer || conversation.length % 2 === 1}
              history={conversation}
              onSubmit={(input) => {
                addLine(input);
                generateAnswer(conversationPrompt(person, [...conversation, input]));
              }}
            />

            {conversation.length > 0 && (
              <Prompt
                prompt={conversationPrompt(person, conversation.slice(0, conversation.length - 1))}
                outcome={conversation[conversation.length - 1]}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}

const descriptionPrompt = (person: Person) => {
  return `Generate a detailed description of ${person.name}, ${person.details}.`;
};

const conversationPrompt = (person: Person, history: string[]) => {
  return [
    `You are ${person.name}, ${person.details}. ${person.description.replace(/\n/g, ' ')}\n`,
    "Human: I'm a human.",
    `${person.name}: I'm ${person.name}.`,
    history.map((line, index) => (index % 2 === 0 ? `Human: ${line}` : `${person.name}: ${line}`)).join('\n'),
    `${person.name}: `,
  ].join('\n');
};

type ConversationProps = {
  person: Person;
  disabled: boolean;
  history: string[];
  onSubmit: (input: string) => void;
};

const Conversation = ({ person, disabled, history, onSubmit }: ConversationProps) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="border rounded col">
      <div ref={messagesRef} className="flex-1 min-h-[440px] max-h-[440px] p-4 col gap-1 overflow-y-auto">
        <div className="mt-auto" />
        {history.map((line, index) => (
          <div key={index}>
            <span className="font-semibold text-gray-700">{index % 2 === 0 ? 'You' : person.name}:</span>{' '}
            {line}
          </div>
        ))}
      </div>
      <form
        className="row border-t items-stretch"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(text);
          setText('');
        }}
      >
        <input
          placeholder={`Say something to ${person.name}...`}
          className="flex-1 px-4 py-3"
          value={text}
          onChange={({ target }) => setText(target.value)}
        />
        <button disabled={text === '' || disabled} className="btn rounded-none shadow-none px-6">
          Send
        </button>
      </form>
    </div>
  );
};

type PersonFormProps = {
  disabled: boolean;
  onSubmit(person: Person): void;
};

const PersonForm = ({ disabled, onSubmit }: PersonFormProps) => {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');

  return (
    <>
      <div>
        Enter the name of anyone, a movie character, a famous musicien, a politician, etc. and give some
        details about who this is.
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ name, details, description: '' });
        }}
      >
        <fieldset disabled={disabled} className="col sm:row gap-4">
          <input
            type="text"
            name="name"
            placeholder="John Dorian"
            className="input"
            value={name}
            onChange={({ target }) => setName(target.value)}
          />

          <input
            type="text"
            name="details"
            placeholder="the main character from scrubs"
            className="input flex-1"
            value={details}
            onChange={({ target }) => setDetails(target.value)}
          />

          <button type="submit" className="btn" disabled={!name || !details}>
            Talk with {name || '...'}
          </button>
        </fieldset>
      </form>
    </>
  );
};

type PromptProps = {
  prompt: string;
  outcome: string;
};

const Prompt = ({ prompt, outcome }: PromptProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-sm col gap-4">
      <button onClick={() => setOpen(!open)} className="row gap-2 items-center self-start">
        <ChevronRightIcon className={clsx('w-4 h-4', open && 'rotate-90')} /> Prompt
      </button>

      {open && (
        <>
          <div>
            Prompt:
            <pre className="px-2 py-1 rounded bg-slate-100 w-full whitespace-pre-wrap">{prompt}</pre>
          </div>

          <div>
            Outcome:
            <pre className="px-2 py-1 rounded bg-slate-100 w-full whitespace-pre-wrap">{outcome}</pre>
          </div>
        </>
      )}
    </div>
  );
};

type Callbacks = {
  onSuccess: (data: string) => void;
  onError: (error: unknown) => void;
};

const useGenerate = ({ onSuccess, onError }: Callbacks) => {
  const { trigger, isMutating } = useSWRMutation<string, unknown, string>(
    '/api/generate',
    async (url, { arg }) => {
      const response = await fetch(url, {
        method: 'POST',
        body: arg,
      });

      if (!response.ok) {
        console.error(response);
        throw new Error('request failed');
      }

      return response.text();
    },
    {
      onSuccess,
      onError,
    }
  );

  return [trigger, isMutating] as const;
};
