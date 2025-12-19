import os
import sys

import typer
from dotenv import load_dotenv
load_dotenv(override=True)
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

# Ensure the root directory is in python path
sys.path.append(os.getcwd())

from services.query import QueryService, ValidationQuery

app = typer.Typer()
console = Console()

@app.command()
def validate(
    query_text: str = typer.Argument(..., help="The natural language query"),
    top_k: int = typer.Option(5, help="Number of results to return"),
    threshold: float = typer.Option(0.0, help="Similarity score threshold")
):
    """
    Validate semantic retrieval by querying the knowledge base.
    """
    load_dotenv()

    try:
        service = QueryService()
        service.initialize()

        query = ValidationQuery(
            query_text=query_text,
            top_k=top_k,
            score_threshold=threshold
        )

        with console.status(f"[bold green]Searching for: '{query_text}'..."):
            response = service.search(query)

        console.print(Panel(f"[bold blue]Query:[/bold blue] {response.query}\n[bold blue]Matches:[/bold blue] {len(response.results)}", title="Validation Results"))

        if not response.results:
            console.print("[yellow]No relevant matches found.[/yellow]")
            return

        for i, result in enumerate(response.results, 1):
            title_display = result.page_title if result.page_title and result.page_title != "unknown" else result.source_url

            table = Table(show_header=False, box=None)
            table.add_row("[bold cyan]Score:[/bold cyan]", f"{result.similarity_score:.4f}")
            table.add_row("[bold cyan]Source:[/bold cyan]", result.source_url)
            if result.page_title and result.page_title != "unknown":
                table.add_row("[bold cyan]Title:[/bold cyan]", result.page_title)
            if result.section_header:
                table.add_row("[bold cyan]Section:[/bold cyan]", result.section_header)

            console.print(Panel(
                result.chunk_text,
                title=f"Result #{i}",
                subtitle=f"{result.similarity_score:.4f}",
                expand=False
            ))
            console.print(table)
            console.print("---")

    except Exception as e:
        console.print(f"[bold red]Error:[/bold red] {str(e)}")
        raise typer.Exit(code=1)

if __name__ == "__main__":
    app()
