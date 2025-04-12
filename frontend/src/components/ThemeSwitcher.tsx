import { Button } from '@/components/ui/button';
import useTheme from '../context/ThemeProvider';

const ThemeSwitcher = () => {
    const { currentTheme, changeTheme } = useTheme();

    const handleThemeChange = () => {
        changeTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };


    return (
        <div className="fixed flex gap-4 top-2 right-2">
            <Button
                className="w-full"
                variant={"default"}
                onClick={handleThemeChange}
            >
                {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
        </div>
    );
};

export default ThemeSwitcher;