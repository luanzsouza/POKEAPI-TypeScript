import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

interface Pokemon {
  name: string,
  url: string,
  weight: number;
  types: string[],
  status: { name: string, value: number }[],

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent {
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 20;
  maxSize = 50;
  pokemonsStartId = 0;
  pokemons: Pokemon[] = [];
  search = '';

  constructor(
    private http: HttpClient
  ) {
    this.getPokemons(this.currentPage);
  }

  pageChanged(event: PageChangedEvent) {
    this.currentPage = event.page;

    this.getPokemons(this.currentPage);
  }

  getPokemons(page: number) {
    const offset = this.itemsPerPage * (page - 1);
    this.http.get(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${this.itemsPerPage}`).subscribe(
      (data: any) => {
        this.pokemons = data.results;
        this.totalItems = data.count;
        this.pokemonsStartId = offset + 1

        this.getPokemonsInfo();
      }
    )
  }

  getPokemonsInfo() {
    this.pokemons.map((pokemon, index) => {
      pokemon.types = [];

      this.http.get(`https://pokeapi.co/api/v2/pokemon/${this.pokemonsStartId + index + 1}`).subscribe(
        (data: any) => {

          data.types.map((type: any) => {
            pokemon.types.push(type.type.name);
          });
        }
      )
    })
  }

  searchPokemon() {
    this.currentPage = 1;

    if (!this.search || this.search === '' ) {
      this.getPokemons(this.currentPage);
    }

    this.http.get(`https://pokeapi.co/api/v2/pokemon/${this.search.toLowerCase()}`).subscribe({
      next: (data: any) => {
        this.pokemons = [{
          url: `https://pokeapi.co/api/v2/pokemon/${data.id}`,
          name: data.name,
          status: [],
          types: data.types.map((type: any) => type.type.name),
          weight: 100
        }];

        this.pokemonsStartId = data.id;
        this.totalItems = data.count;
      },
      error: (error: any) => {
        console.log('Not found')
      }
    });
  }

  printPokemonName(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  printPokemonTypes(index: number) {
    return this.pokemons[index]?.types?.join(', ');
  }

  onSearchChange(event: string) {
    this.search = event;
  }
}
