package Hampus.place;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Value;

@Builder
@Value(staticConstructor = "of")
@NoArgsConstructor(force = true, access = AccessLevel.PRIVATE)
@AllArgsConstructor
public class Pixel {
  int r;
  int g;
  int b;
  int a;
  int x;
  int y;


}
