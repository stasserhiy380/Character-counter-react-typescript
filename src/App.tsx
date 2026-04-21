import {useEffect, useState, type Dispatch, type SetStateAction} from 'react'

import './App.css'
import icon_moon from './assets/images/icon-moon.svg'
import icon_sun from './assets/images/icon-sun.svg'

import logo_dark_theme from './assets/images/logo-dark-theme.svg'
import logo_light_theme from './assets/images/logo-light-theme.svg'



type HeaderProps = {
  theme: "light" | "dark";
  toggleTheme: ()=> void;
}



function Header({theme, toggleTheme}:HeaderProps){
  const logo_element = <div className="logo-product-name"><img src={theme === "light" ? logo_light_theme : logo_dark_theme} alt="logo"></img></div>;
  const moon = <button onClick={toggleTheme} className="toggl-btn"><img src={theme === "light"? icon_moon : icon_sun} alt="switch-moon"></img></button>;

  return (<header>{logo_element}{moon}</header>);
}
type TextAreaProps = {
    state: State;
    setStructure: React.Dispatch<React.SetStateAction<State>>;
};
function TextArea({ state, setStructure }: TextAreaProps) {
    function onChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
        const newText = event.currentTarget.value;

        setStructure((prev) => {
            const newTotalCharacters = countCharacters(newText, prev.exclude_spaces);

            if (
                prev.is_character_limit_enabled &&
                newTotalCharacters > prev.character_limit_number
            ) {
                return {
                    ...prev,
                    is_limit_exceeded: true,
                };
            }

            return {
                ...prev,
                text: newText,
                total_characters: newTotalCharacters,
                word_count: countWords(newText),
                sentence_count: countSentences(newText),
                character_frequency: countCharacterFrequency(
                    newText,
                    prev.exclude_spaces
                ),
                is_limit_exceeded: false,
            };
        });
    }

    return (
        <textarea
            value={state.text}
            onChange={onChange}
            className={`text-area ${state.is_limit_exceeded ? "text-area-error" : ""}`}
            placeholder="Start typing here… (or paste your text)"
        />
    );
}


function Heading(){
  return (<h1>Analyze your text in real-time</h1>)
}

type BoxProps = {
    urlImg: string,
    amount: number,
    what_is_it:string,
    bg:string;
}

type StatisticProps = {
    state: State;
};


function countWords(text: string): number {
    const trimmed = text.trim();
    if (trimmed === "") return 0;
    return trimmed.split(/\s+/).length;
}

function countSentences(text: string): number {
    const matches = text.match(/[.!?]+/g);
    return matches ? matches.length : 0;
}

function countCharacters(text: string, excludeSpaces: boolean): number {
    return excludeSpaces ? text.replace(/\s/g, "").length : text.length;
}
function Box({urlImg, amount, what_is_it, bg}:BoxProps){
    const styles = {
        backgroundColor: bg
    };
    return (<div style={styles}  className={"box-wrapper"}>
        <div className="amount-what_is_it-wrapper">
            <p>{amount}</p>
            <p>{what_is_it}</p>
        </div>
        <img src={urlImg} alt="background-image"></img>
    </div>)
}




function Statistic({state}:StatisticProps){
    console.log(state.total_characters);
    return (<div className={"statistics-wrapper"}>
        <Box urlImg={"src/assets/images/pattern-character-count.svg"} amount={state.total_characters} what_is_it={"Total Characters"} bg={"#D3A0FA"}></Box>
        <Box urlImg={"src/assets/images/pattern-word-count.svg"} amount={state.word_count} what_is_it={"Word Count"} bg={"#FF9F00"}></Box>
        <Box urlImg={"src/assets/images/pattern-sentence-count.svg"} amount={state.sentence_count} what_is_it={"Sentence Count"} bg={"#FE8159"}></Box>
    </div>)
}
interface FormProps{
    state: State;
    setState: Dispatch<SetStateAction<State>>;
}


function Form({ state, setState }: FormProps) {
    function onExcludeSpacesChange(
        event: React.ChangeEvent<HTMLInputElement>
    ): void {
        const checked = event.currentTarget.checked;

        setState((prev:State) => ({
            ...prev,
            exclude_spaces: checked,
            total_characters: countCharacters(prev.text, checked),
            character_frequency: countCharacterFrequency(prev.text, checked),
        }));
    }

    function onCharacterLimitToggle(
        event: React.ChangeEvent<HTMLInputElement>
    ): void {
        const checked = event.currentTarget.checked;

        setState((prev:State) => ({
            ...prev,
            is_character_limit_enabled: checked,
        }));
    }

    function onCharacterLimitChange(
        event: React.ChangeEvent<HTMLInputElement>
    ): void {
        const value = event.currentTarget.value;

        setState((prev:State) => ({
            ...prev,
            character_limit_number: value === "" ? 0 : Number(value),
        }));
    }

    const remaining = getRemainingCharacters(
        state.total_characters,
        state.is_character_limit_enabled,
        state.character_limit_number
    );




    return (
        <div>
            <form>
                <div className="check-box-wrapper">
                    <input
                        id="exclude_spaces"
                        checked={state.exclude_spaces}
                        onChange={onExcludeSpacesChange}
                        name="exclude_spaces"
                        type="checkbox"
                    />
                    <label htmlFor="exclude_spaces">Exclude Spaces</label>
                </div>

                <div className="check-box-wrapper">
                    <input
                        id="set_character_limit"
                        checked={state.is_character_limit_enabled}
                        onChange={onCharacterLimitToggle}
                        name="set_character_limit"
                        type="checkbox"
                    />
                    <label htmlFor="set_character_limit">Set Character Limit</label>
                </div>

                {state.is_character_limit_enabled && (
                    <input
                        type="number"
                        min="0"
                        value={state.character_limit_number}
                        onChange={onCharacterLimitChange}
                        placeholder="0"
                    />
                )}

                {state.is_character_limit_enabled && remaining !== null && (
                    <p className={remaining === 0 ? "limit-error" : "limit-info"}>
                        {remaining === 0
                            ? `Limit reached! Your text exceeds ${state.character_limit_number}.`
                            : `${remaining} characters remaining`}
                    </p>
                )}

                <p className="approx">
                    {estimateReadingTime(state.word_count)}
                </p>
            </form>
        </div>
    );
}
function estimateReadingTime(wordCount: number): string {
    const wordsPerMinute = 200;

    if (wordCount <= 0) {
        return "Approx. reading time: 0 minutes";
    }

    const minutes = wordCount / wordsPerMinute;

    if (minutes < 1) {
        return "Approx. reading time: <1 minute";
    }

    const roundedMinutes = Math.ceil(minutes);

    return `Approx. reading time: ${roundedMinutes} ${
        roundedMinutes === 1 ? "minute" : "minutes"
    }`;
}



interface State {
    text: string;
    total_characters: number;
    exclude_spaces: boolean;
    word_count: number;
    sentence_count: number;
    character_limit_number: number;
    character_frequency: Record<string, number>;
    is_character_limit_enabled: boolean;
    is_limit_exceeded: boolean;
}



function countCharacterFrequency(
    text: string,
    excludeSpaces: boolean
): Record<string, number> {
    const frequency: Record<string, number> = {};

    for (const char of text) {
        if (excludeSpaces && /\s/.test(char)) {
            continue;
        }

        frequency[char] = (frequency[char] || 0) + 1;
    }

    return frequency;
}

type CharacterProgressProps = {
    character: string;
    count: number;
    totalCharacters: number;
};

function CharacterProgress({
                               character,
                               count,
                               totalCharacters,
                           }: CharacterProgressProps) {
    const percent =
        totalCharacters > 0 ? (count / totalCharacters) * 100 : 0;

    return (
        <div className="progress-wrapper">
            <p className="progress-character">
                {character === " " ? "Space" : character}
            </p>

            <progress value={count} max={totalCharacters || 1}></progress>

            <p className="progress-percentage">
                {count} ({percent.toFixed(1)}%)
            </p>
        </div>
    );
}

type CharacterFrequencyListProps = {
    characterFrequency: Record<string, number>;
    totalCharacters: number;
};

function CharacterFrequencyList({
                                    characterFrequency,
                                    totalCharacters,
                                }: CharacterFrequencyListProps) {
    const [showAll, setShowAll] = useState(false);

    const entries = Object.entries(characterFrequency ?? {}).sort(
        (a, b) => b[1] - a[1]
    );

    const visibleEntries = showAll ? entries : entries.slice(0, 5);

    if (entries.length === 0) {
        return null;
    }

    return (
        <section className="letter-density">
            <h2 className="letter-density-title">Letter Density</h2>

            <div className="letter-density-list">
                {visibleEntries.map(([character, count]) => (
                    <CharacterProgress
                        key={character}
                        character={character}
                        count={count}
                        totalCharacters={totalCharacters}
                    />
                ))}
            </div>

            {entries.length > 5 && (
                <button
                    type="button"
                    className="see-more-btn"
                    onClick={() => setShowAll((prev) => !prev)}
                >
                    {showAll ? "See less" : "See more"}
                    <span className={`arrow ${showAll ? "up" : "down"}`}></span>
                </button>
            )}
        </section>
    );
}




function getRemainingCharacters(
    totalCharacters: number,
    isEnabled: boolean,
    limit: number
): number | null {
    if (!isEnabled) {
        return null;
    }

    return limit - totalCharacters;
}




function App() {
    const [structure, setStructure] = useState<State>({
        text: "",
        total_characters: 0,
        exclude_spaces: false,
        word_count: 0,
        sentence_count: 0,
        character_limit_number: 0,
        character_frequency: {},
        is_character_limit_enabled: false,
        is_limit_exceeded: false,
    });



    const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? "dark" : "light";
  });
    useEffect(() => {
         localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);


  const toggleTheme = (): void => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
      <div>
          <Header theme={theme} toggleTheme={toggleTheme}>
          </Header>
          <Heading>
          </Heading>
          <TextArea state={structure} setStructure={setStructure} />
          <Form state={structure} setState={setStructure} />
          <Statistic state={structure}></Statistic>
          <CharacterFrequencyList
              characterFrequency={structure.character_frequency}
              totalCharacters={structure.total_characters}
          />
      </div>
  );
}

export default App
