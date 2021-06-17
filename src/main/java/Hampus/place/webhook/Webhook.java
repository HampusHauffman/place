package Hampus.place.webhook;

import Hampus.place.Pixel;
import Hampus.place.redis.RedisMessagePublisher;
import Hampus.place.redis.RedisRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.Optional;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping
@Slf4j
@Component
public class Webhook {

  @Autowired
  SimpMessagingTemplate template;

  @Autowired
  RedisRepo redisRepo;

  @Autowired
  RedisMessagePublisher redisMessagePublisher;

  ObjectMapper objectMapper = new ObjectMapper();

  @Value("${spring.redis.host}")
  String redisHost;

  @GetMapping("/board/{x}/{y}")
  public @ResponseBody
  String test(@PathVariable(value = "x") int x, @PathVariable(value = "y") int y) {
    log.info("GetMapping on /");
    return redisRepo.getPixel(x, y).toString();
  }

  private @ResponseBody
  String fill() {
    log.info("Filling");
    redisRepo.setAllOnce();
    return "Filled the board";
  }


  @SneakyThrows
  @SubscribeMapping("/topic/place") //app/subscribe
  public byte[] sendOneTimeMessage() {
    log.info("A subscriber Connected");
    var allPixels = redisRepo.getAllPixels();
    return allPixels;
  }

  @GetMapping("/board")
  public ResponseEntity<String> getBoard() {
    var allPixels = redisRepo.getAllPixels();
    return ResponseEntity.of(Optional.of(Arrays.toString(allPixels)));
  }

  @GetMapping("/board/raw")
  public ResponseEntity<byte[]> getBoardRaw() {
    var allPixels = redisRepo.getAllPixels();
    return ResponseEntity.of(Optional.of(allPixels));
  }

  @SneakyThrows
  @MessageMapping("/pixel")
  public void pixels(@Payload String pixel) {
    log.info("Got a Pixel from client: {} ", pixel);
    Pixel p = objectMapper.readValue(pixel, Pixel.class);

    if (p.getColor() > 15 || p.getColor() < 0) {
      return;
    }

    redisRepo.setPixel(p);
    redisMessagePublisher.publish(p);
  }

  @SneakyThrows
  public void sendPixel(Pixel p) {
    log.info("Sending Pixel: {}", p);
    template.convertAndSend("/topic/place", objectMapper.writeValueAsString(p));
  }


}
