package game;

import java.io.IOException;
import java.util.Map;
import fi.iki.elonen.NanoHTTPD;

public class App extends NanoHTTPD {

    public static void main(String[] args) {
        try {
            new App();
        } catch (IOException ioe) {
            System.err.println("Couldn't start server:\n" + ioe);
        }
    }

    private Game game;

    /**
     * Start the server at :8080 port.
     * @throws IOException
     */
    public App() throws IOException {
        super(8080);

        this.game = new Game();

        start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
        System.out.println("\nRunning!\n");
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Map<String, String> params = session.getParms();
        if (uri.equals("/newgame")) {
            this.game = new Game();
        } else if (uri.equals("/play")) {
            // e.g., /play?x=1&y=1
            this.game = this.game.play(Integer.parseInt(params.get("x")), Integer.parseInt(params.get("y")));
        } else if (uri.equals("/undo")) {
            if (!this.game.getHistory().isEmpty()) {
                this.game = this.game.getHistory().get(this.game.getHistory().size() - 1);
            }
        }
        GameState gameplay = GameState.forGame(this.game);
        return newFixedLengthResponse(gameplay.toString());
    }
    

    public static class Test {
        public String getText() {
            return "Hello World!";
        }
    }
}